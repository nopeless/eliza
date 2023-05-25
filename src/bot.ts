import { Client, GuildMember, User } from "discord.js";
import eventCreate from "./event-create";
import { Hellgate, Ring } from "hellgate";
import { writeFile } from "fs/promises";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

// https://stackoverflow.com/a/6969486/10629176
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`); // $& means the whole matched string
}

class ElizaClient extends Client {
  public dev: boolean;
  public ownerID: string;
  public applicationCommandCache?: string;
  public readonly prefix: RegExp;
  public readonly workingDirectory: string;
  public hell;
  public guildRing;

  public dataFile: string;
  public data: {
    people: {
      match: string[];
      id: string;
    }[];
  };

  constructor(
    options: {
      dev?: boolean;
      ownerID?: string;
      /**
       * Directory to store data
       *
       * defaults to `./data`
       */
      workingDirectory?: string;
      prefix?: string | RegExp;
    } & ConstructorParameters<typeof Client>[0]
  ) {
    super(options);
    this.dev = options.dev ?? true;
    this.ownerID = options.ownerID ?? ``;
    this.prefix = options.prefix
      ? options.prefix instanceof RegExp
        ? options.prefix
        : new RegExp(`^` + escapeRegExp(options.prefix))
      : /^!/;
    // gonna be used some day
    this.workingDirectory = options.workingDirectory ?? `./data`;

    for (const [event, handler] of Object.entries(eventCreate)) {
      console.log(`Registering ${event}: ${Object.keys(handler.handlerObj)}`);
      // correspondance problem
      this.on(event as never, handler.fn.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = this;

    this.hell = new Hellgate(
      {
        getUser(user: GuildMember | User) {
          return {
            id: user.id,
          };
        },
      },
      {
        saveFile(user) {
          if (!user) return false;
          return client.ownerID === user.id;
        },
      }
    );

    this.guildRing = new Ring(this.hell, {
      getSin(member: GuildMember) {
        return {
          displayRoles: member.roles.cache.map((role) => role.name),
        };
      },
    });

    this.dataFile = join(this.workingDirectory, `data.json`);

    // check if file exists
    if (!statSync(this.workingDirectory).isFile()) {
      // create dir recursively
      mkdirSync(this.workingDirectory, { recursive: true });
      writeFileSync(
        this.dataFile,
        JSON.stringify({ people: [] } satisfies (typeof this)["data"])
      );
    }

    this.data = JSON.parse(readFileSync(this.dataFile, `utf-8`));
  }

  public async saveFile() {
    await writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
  }
}

// Singleton
export { ElizaClient };
