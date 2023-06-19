import { ActivityType, Client, GuildMember, User } from "discord.js";
import eventCreate from "./event-create";
import { Hellgate, Ring } from "hellgate";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { escapeRegExp } from "./lib/util";

class ElizaClient extends Client {
  public dev: boolean;
  public ownerID: string;
  public applicationCommandCache?: string;
  public readonly prefix: RegExp;
  public readonly workingDirectory: string;
  public hell;
  public guildRing;
  public heat = 0;
  protected _heatInterval!: NodeJS.Timeout;

  public dataFile!: string;
  public data!: {
    suggestions: {
      author: string;
      content: string;
    }[];
    people: {
      match: string[];
      id: string;
    }[];
  };

  constructor(
    options: {
      dev?: boolean;
      ownerID?: string;
      status?: string;
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
        : new RegExp(`^` + escapeRegExp(options.prefix), `i`)
      : /^!/;
    // gonna be used some day
    this.workingDirectory = options.workingDirectory ?? `./data`;

    this._initializeHeatCooldown();
    this._registerEvents();
    this._loadDataFile();
    this._initiatePresenceOnLoad(options);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = this;

    // Register hellgate
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
        exitApplication(user) {
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
  }
  private _registerEvents() {
    for (const [event, handler] of Object.entries(eventCreate)) {
      console.log(`Registering ${event}: ${Object.keys(handler.handlerObj)}`);
      // correspondance problem
      this.on(event as never, async (arg) => {
        const res = await handler.fn.bind(this)(arg);
        if (this.isReady() && res?.replied) {
          this.heat += 1;
        }
      });
    }
  }

  public async saveFile() {
    await writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
  }

  protected _loadDataFile() {
    this.dataFile = join(this.workingDirectory, `data.json`);

    // create dir recursively
    mkdirSync(this.workingDirectory, { recursive: true });
    if (!existsSync(this.dataFile)) {
      writeFileSync(
        this.dataFile,
        JSON.stringify({
          people: [],
          suggestions: [],
        } satisfies (typeof this)["data"])
      );
    }

    // TODO validate and fill missing
    this.data = {
      people: [],
      suggestions: [],
      ...JSON.parse(readFileSync(this.dataFile, `utf-8`)),
    };
  }

  protected _initiatePresenceOnLoad(options: { status?: string }) {
    this.on(`ready`, () => {
      this.user?.setActivity({
        type: ActivityType.Watching,
        name: options.status ?? `you play`,
      });
      this.user?.setPresence({
        status: `online`,
      });
    });
  }

  protected _initializeHeatCooldown() {
    this._heatInterval = setInterval(() => {
      if (this.heat / 5 > 0.6) {
        // sending more than 1 message per second
        // disable all commands
        console.error(
          `Too many messages collected. Bot might be rouge. Disabling all commands and idling`
        );
        this.removeAllListeners();

        this.user?.setActivity(`I need a break`);

        this.user?.setPresence({
          status: `dnd`,
        });
        this.heat = 0;
      }
      this.heat *= 0.9; // collect over 5 seconds
    }, 500);
  }

  public async destroy() {
    clearInterval(this._heatInterval);
    await this.saveFile();
    // TODO remove this after
    // https://github.com/discordjs/discord.js/pull/9600
    // is resolved
    if (!this.isReady()) return;
    return super.destroy();
  }
}

// Singleton
export { ElizaClient };
