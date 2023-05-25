import { ChannelType, Message, ClientEvents } from "discord.js";
import { ProcessedMessage } from "./discord";
import { ElizaClient } from "./bot";

// If this becomes a library, this entire thing should be a typed function

type ChannelTypeString = keyof typeof ChannelType;

type createChatReplyOptions<Client extends ElizaClient> = {
  name: string;
  description?: string;
  scope?: (ChannelTypeString | ChannelType)[] | ChannelType | ChannelTypeString;

  /**
   * Returning a string means the function is hinting at the user
   *
   * If no replies are made, the strings are joined and then sent as a single message
   */
  exec(
    this: Client,
    message: ProcessedMessage
  ): void | string | string[] | Promise<void | string | string[]>;

  // TODO
  // permissions
};

/**
 * Make sure you pass in a compiled regex
 */
export function preprocessMessage<Client extends { prefix: RegExp }>(
  this: Client,
  message: Message
): ProcessedMessage | null {
  if (this.prefix.flags.includes(`g`) || this.prefix.sticky) {
    throw new Error(`Prefix must not be global or sticky`);
  }

  const newMessage = message as ProcessedMessage;
  const match = this.prefix.exec(message.content);

  if (!match) {
    return null;
  }

  newMessage.prefixlessContent = message.content.slice(match[0].length);
  newMessage.prefixMatch = match;

  // Defaults
  newMessage.replied = false;

  const replyFunction = message.reply;

  // Inject
  newMessage.reply = function (
    this: ProcessedMessage,
    ...args: Parameters<Message[`reply`]>
  ) {
    this.replied = true;
    return replyFunction.apply(this, args);
  };

  return newMessage;
}

export function createChatReply({
  name,
  description,
  scope,
  exec,
}: createChatReplyOptions<ElizaClient>) {
  return {
    name,
    description,
    scope,
    exec,
  };
}

function scopeAllowed(
  scopes:
    | ChannelTypeString
    | ChannelType
    | (ChannelTypeString | ChannelType)[]
    | undefined,
  type: ChannelType
): boolean {
  if (scopes === undefined) return true;
  if (!Array.isArray(scopes)) {
    return type === ChannelType[scopes] || type === scopes;
  }

  return scopes.some((scope) => scopeAllowed(scope, type));
}

export function createMessageCreateHandler(
  handlerObj: Record<string, createChatReplyOptions<ElizaClient>>
) {
  return {
    handlerObj,
    fn: async function (
      this: ElizaClient,
      ...args: ClientEvents[`messageCreate`]
    ) {
      const message = args[0];

      // calculate prefix
      const processedMessage = preprocessMessage.call(this, message);

      if (!processedMessage) {
        return;
      }

      const errors: { namespace: string; error: string }[] = [];

      for (const [namespace, handler] of Object.entries(handlerObj)) {
        if (!scopeAllowed(handler.scope, message.channel.type)) {
          continue;
        }

        const result = await (async () =>
          handler.exec.call(this, processedMessage))().catch((e) => {
          console.error(e);
          return `internal error has occured`;
        });

        if (processedMessage.replied) {
          // we are done
          if (result) {
            console.warn(
              `Message ${message.id} was replied to, but the handler ${namespace} returned a value`
            );
          }
          break;
        }

        if (result) {
          if (typeof result === `string`) {
            errors.push({ namespace, error: result });
          } else if (Array.isArray(result)) {
            errors.push(...result.map((e) => ({ namespace, error: e })));
          }
        }
      }

      if (processedMessage.replied) return;

      if (errors.length === 0) {
        // Use context parser here to check if they are actually directing this to eliza
        // await message.reply(`I'm sorry, I don't understand your request at all`);
        console.log(
          `message was ${processedMessage.content}, but no handler was found`
        );
        return;
      }
      if (errors.length == 1) {
        await message.reply(errors[0].error);
        return;
      }

      await message.reply(
        errors
          .map(({ namespace, error }) => `${namespace}: ${error}`)
          .join(`\n`)
      );
    },
  };
}
