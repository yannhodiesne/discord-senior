import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

interface IJuniorReply {
	content: string;
	chances: number;
}

@ApplyOptions<ListenerOptions>({
	event: Events.MessageCreate,
})
export class JuniorListener extends Listener {
	public async run(message: Message) {
		if (message.author.id !== '1007028483505012807') return;
		// barkdev: if (message.author.id !== '148744805269110785') return;

		if (Math.random() < 0.8) return;

		const replies: IJuniorReply[] = [
			{ content: 'tg', chances: 10 },
			{ content: 'gg', chances: 40 },
			{ content: 'allez', chances: 20 },
			{ content: 'je suis fier de toi tu t\'en sors très bien', chances: 5 },
		];

		const max = replies.reduce((sum, current) => sum + current.chances, 0);

		let totalPercentage = 0;

		const sortedReplies: IJuniorReply[] = replies.map((rep) => {
			totalPercentage += rep.chances / max;

			return {
				content: rep.content,
				chances: totalPercentage,
			};
		}).sort((a, b) => a.chances - b.chances);

		const random = Math.random();
		const selectedReply = sortedReplies.find((rep) => random <= rep.chances);

		await reply(message, selectedReply?.content ?? 'AGAGOUGOUK');
	}
}
