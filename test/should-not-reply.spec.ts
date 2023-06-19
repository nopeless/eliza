import { client } from "./fixtures";
import { readFileLines } from "./readFile";
console.log(client);
const messages: string[] = readFileLines("./test-messages.txt")
describe(`should not reply`, () => {
	for (const message of messages) {
		test(message, async () => {
			const m = await client.send(message);
			expect(m.mockReplies).to.have.length(0);
		});
	}
});
