import { ApplyOptions } from '@sapphire/decorators';
import { Command, type ApplicationCommandRegistry, type CommandOptions } from '@sapphire/framework';
import { userMention } from 'discord.js';

import db from '../database';
import type { SecretSantaMappings } from '../types/secretsanta';

const Data = {
	generated: 'secretsanta.generated',
};

@ApplyOptions<CommandOptions>({
	name: 'secretsanta',
	description: 'Secret Santa ✨🎄🎅',
})
export class SecretSantaCommand extends Command {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => builder
			.setName(this.name)
			.setDescription(this.description)
			.setDMPermission(false));
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const mappings = await db.getMap<SecretSantaMappings>(Data.generated, new Map());

		if (mappings.size === 0) {
			await interaction.editReply(':x: Le Secret Santa n\'a pas encore été généré !');
			return;
		}

		const pair = mappings.get(interaction.user.id);

		if (!pair) {
			await interaction.editReply(`Tu n'es pas inscrit au Secret Santa :cry:`);
		} else {
			await interaction.editReply({
				content: `Tu es le Secret Santa de ${userMention(pair)} ✨🎄🎅\n*Ne t'en fais pas, personne d'autre ne peut voir ce message*`,
				allowedMentions: { users: [pair] }
			});
		}
	}
}
