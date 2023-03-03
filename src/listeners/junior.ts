import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	event: Events.MessageCreate,
})
export class JuniorListener extends Listener {
	public async run(message: Message) {
		if (message.author.id !== '1007028483505012807') return;

		if (Math.random() < 0.8) return;

		await reply(message, 'tg');
	}
}
