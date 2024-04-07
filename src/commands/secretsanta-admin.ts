import { Subcommand, SubcommandOptions } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { PermissionFlagsBits, userMention } from 'discord.js';

import db from '../database';
import type { SecretSantaUser, SecretSantaList, SecretSantaMappings, SecretSantaConflicts, SecretSantaConflict } from '../types/secretsanta';

const Data = {
	list: 'secretsanta.list',
	conflicts: 'secretsanta.conflicts',
	mappings: 'secretsanta.mappings',
	generated: 'secretsanta.generated',
};

@ApplyOptions<SubcommandOptions>({
	name: 'secretsanta-admin',
	description: 'Secret Santa ✨🎄🎅 (ADMIN)',
	requiredUserPermissions: ['Administrator'],
	subcommands: [
		{ name: 'generate', chatInputRun: 'chatInputGenerate' },
		{ name: 'list', chatInputRun: 'chatInputList' },
		{ name: 'conflicts', chatInputRun: 'chatInputConflicts' },
		{ name: 'delete', chatInputRun: 'chatInputDelete' },
	],
})
export class SecretSantaAdminCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => builder
			.setName(this.name)
			.setDescription(this.description)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
			.setDMPermission(false)
			.addSubcommand((subcommand) => subcommand
				.setName('generate')
				.setDescription('Génère le Secret Santa puis l\'enregistre'))
			.addSubcommand((subcommand) => subcommand
				.setName('list')
				.setDescription('Affiche ou modifie la liste des inscrits')
				.addUserOption((option) => option
					.setName('légenfan')
					.setDescription('Ajoute ou supprime le légenfan de la liste')
					.setRequired(false)))
			.addSubcommand((subcommand) => subcommand
				.setName('conflicts')
				.setDescription('Affiche ou modifie la liste des conflicts')
				.addUserOption((option) => option
					.setName('légenfan1')
					.setDescription('Ajoute ou supprime le légenfan de la liste')
					.setRequired(false))
				.addUserOption((option) => option
					.setName('légenfan2')
					.setDescription('Ajoute ou supprime le légenfan de la liste')
					.setRequired(false)))
			.addSubcommand((subcommand) => subcommand
				.setName('delete')
				.setDescription('Supprime le Secret Santa généré (à faire APRÈS la fin d\'année 🙏)')));
	}

	public async chatInputGenerate(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		
		let mappings = await db.getMap<SecretSantaMappings>(Data.generated, new Map());

		if (mappings.size !== 0) {
			await interaction.editReply(':x: Le Secret Santa est déjà généré !');
			return;
		}

		const list = await db.get<SecretSantaList>(Data.list, []);
		const conflicts = await db.get<SecretSantaConflicts>(Data.conflicts, []);

		mappings = new Map();

		do {
			list.forEach((user) => {
				mappings.set(user, this.getAttribution(mappings, list, conflicts, user));
			});
		} while (Array.from(mappings.values()).includes(null));

		await db.setMap(Data.generated, mappings);

		let moreContent = '';

		if (process.env.DEBUG_PRINT === 'true') {
			const prettyGenerated = Array.from(mappings.entries()).map(([user1, user2]) => `- ${userMention(user1)} <=> ${userMention(user2!)}`);
			moreContent = `\n:santa: List des secret santa DEBUG :christmas_tree:\n${prettyGenerated.join('\n')}`;
		}

		await interaction.editReply(`:white_check_mark: Secret Santa généré !${moreContent}`);
	}

	public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser('légenfan');
		const list = await db.get<SecretSantaList>(Data.list, []);

		if (user === null) {
			const content = `:santa: Liste des inscrits au Secret Santa :christmas_tree:\n- ${list.map((id) => userMention(id)).join('\n- ')}`;

			await interaction.editReply({ content });
		} else if (list.some((u) => user.id === u)) {
			list.splice(list.findIndex((u) => u === user.id), 1);
			await db.set(Data.list, list);

			const content = `:x: ${userMention(user.id)} a été enlevé de la liste du Secret Santa`;
			await interaction.editReply({ content, allowedMentions: { users: [user.id] } });
		} else {
			await db.set(Data.list, [...list, user.id]);

			const content = `:white_check_mark: ${userMention(user.id)} a été ajouté à la liste du Secret Santa`;
			await interaction.editReply({
				content,
				allowedMentions: { users: [user.id] },
			});
		}
	}

	public async chatInputConflicts(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const user1 = interaction.options.getUser('légenfan1');
		const user2 = interaction.options.getUser('légenfan2');
		const conflicts = await db.get<SecretSantaConflicts>(Data.conflicts, []);

		if (user1 === null && user2 === null) {
			const prettyConflicts = conflicts.map((conflict) => `- ${userMention(conflict[0])} <=> ${userMention(conflict[1])}`);
			const content = `:santa: Liste des personnes qui ne peuvent pas se matcher au Secret Santa :christmas_tree:\n${prettyConflicts.join('\n')}`;

			await interaction.editReply({ content });
		} else if (user1 === null || user2 === null) {
			await interaction.editReply({
				content: 'Il faut deux personnes pour avoir un conflict :angrypup:',
			});
		} else if (this.conflictExists(conflicts, user1.id, user2.id)) {
			conflicts.splice(conflicts.findIndex((c) => this.conflictEquals(c, user1.id, user2.id)), 1);
			await db.set(Data.conflicts, conflicts);

			const content = `:x: ${userMention(user1.id)} et ${userMention(user2.id)} ont été enlevés des conflicts du Secret Santa`;
			await interaction.editReply({
				content,
				allowedMentions: { users: [user1.id, user2.id] },
			});
		} else {
			const newConflict: SecretSantaConflict = [user1.id, user2.id];

			await db.set(Data.conflicts, [...conflicts, newConflict]);

			const content = `:white_check_mark: ${userMention(user1.id)} et ${userMention(user2.id)} ont été ajoutés aux conflicts du Secret Santa`;
			await interaction.editReply({
				content,
				allowedMentions: { users: [user1.id, user2.id] },
			});
		}
	}

	public async chatInputDelete(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		await db.setMap(Data.generated, new Map());

		await interaction.editReply(':recycle: Le Secret Santa a été supprimé et devra être regénéré !');
	}

	private conflictExists(
		conflicts: SecretSantaConflicts,
		user1: SecretSantaUser,
		user2: SecretSantaUser,
	): boolean {
		return conflicts.some((d) => this.conflictEquals(d, user1, user2));
	}

	private conflictEquals(
		conflict: SecretSantaConflict,
		user1: SecretSantaUser,
		user2: SecretSantaUser,
	): boolean {
		return (conflict[0] === user1 && conflict[1] === user2)
			|| (conflict[0] === user2 && conflict[1] === user1);
	}

	private getAttribution(
		mappings: SecretSantaMappings,
		list: SecretSantaList,
		conflicts: SecretSantaConflicts,
		user: SecretSantaUser,
	): SecretSantaUser | null {
		const used = Array.from(mappings.values());

		let count = 0;
		let result: SecretSantaUser | null;

		do {
			count++;

			if (count > 50) {
				return null;
			}

			result = list[Math.floor(Math.random() * list.length)] ?? null;
		} while (
			result === null
			|| user === result
			|| used.includes(result)
			|| this.conflictExists(conflicts, user, result)
		);

		return result;
	}
}
