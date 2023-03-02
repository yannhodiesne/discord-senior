import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<CommandOptions>({
	name: 'ping',
	aliases: ['pong'],
	description: 'ping pong',
})
export class PingCommand extends Command {
	public async messageRun(message: Message) {
		const msg = await send(message, 'oh noes');

		const content = `Pong! Latence WS:${Math.round(this.container.client.ws.ping)}ms. Latence API: ${msg.createdTimestamp - message.createdTimestamp}ms.`;

		await msg.edit(content);
	}
}
