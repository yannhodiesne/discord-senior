/* eslint-disable import/first */
import * as dotenv from 'dotenv';

dotenv.config();

import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import '@sapphire/plugin-editable-commands/register';

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	loadMessageCommandListeners: true,
	baseUserDirectory: __dirname,
});

client.login(process.env.DISCORD_TOKEN)
	// eslint-disable-next-line no-console
	.catch((err) => console.error(err));
