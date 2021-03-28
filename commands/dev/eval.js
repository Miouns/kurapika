const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const Akairo = require('discord-akairo');
const Discord = require('discord.js');
const axios = require('axios');

class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'e', 'ev'],
			ownerOnly: true,
			category: 'Dev',
			description: {
				content: 'Evaluate Command',
				usage: 'eval <code>',
				example: [
					'eval 1+1',
					'eval message.channel.send("Hello world")',
					'eval msg.channel.send("Hello world")'
				]
			}
		});
	}

	async clean(client, text) {
		if (text && text.constructor.name == 'Promise') text = await text;
		if (typeof text !== 'string')
			text = require('util').inspect(text, {
				depth: 1
			});
		const token = RegExp(`${client.token}`, 'gi');
		const mongo_pass = RegExp(`${process.env.MONGO_PASS}`, 'gi');
		const mongo_user = RegExp(`${process.env.MONGO_USER}`, 'gi');

		text = text
			.replace(/`/g, '`' + String.fromCharCode(8203))
			.replace(/@/g, '@' + String.fromCharCode(8203))
			.replace(token, '<TOKEN>')
			.replace(mongo_pass, '<MONGO_PASS>')
			.replace(mongo_user, '<MONGO_USER>');

		return text;
	}

	hastebin(input, c = this.client) {
	  return new Promise((res, rej) => {
	    if(!input) rej("[Error] Missing Input!")
	    c.sourcebin.postBin({ code: input, title: "Eval Results" }).then(link => res(link))
	  })
	}

	async exec(message) {
		let args = message.content
			.slice(message.guild.prefix.length)
			.trim()
			.split(/ +/)
			.slice(1);
		let code = args.join(' ');
		const msg = message,
		      bot = this.client,
		      client = bot
		try {
			const evaled = eval(code);
			const clean = await this.clean(this.client, evaled);
			if (clean.length > 2000) message.util.send(await this.hastebin(clean));
			else message.util.send(`\`\`\`js\n${clean}\n\`\`\``);
		} catch (err) {
			message.util.send(
				`\`ERROR\` \`\`\`\n${await this.clean(this.client, err)}\n\`\`\``
			);
		}
	}
}

module.exports = EvalCommand;
