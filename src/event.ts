import { ChannelType, Message, ClientEvents } from "discord.js";
import { ProcessedMessage } from "./discord";
import { ElizaClient } from "./bot";
import { sortByKey } from "./lib/util";
import { toWordList } from "./lib/nlp";

// If this becomes a library, this entire thing should be a typed function

type ChannelTypeString = keyof typeof ChannelType;

type createChatReplyOptions<Client extends ElizaClient> = {
  name: string;
  description?: string;
  aliases?: string[];
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

const JustSkip = Symbol(`JustSkip`);

/**
 * Make sure you pass in a compiled regex
 */
export function preprocessMessage<Client extends { prefix: RegExp }>(
  this: Client,
  message: Message
): ProcessedMessage {
  if (this.prefix.flags.includes(`g`) || this.prefix.sticky) {
    throw new Error(`Prefix must not be global or sticky`);
  }

  const newMessage = message as ProcessedMessage;
  const match = this.prefix.exec(message.content);

  const prefixlessContent = match && message.content.slice(match[0].length);
  const prefixMatch = match;

  Object.defineProperty(newMessage, `prefixlessContent`, {
    get() {
      if (prefixlessContent === null) {
        throw JustSkip;
      }
      return prefixlessContent;
    },
  });

  newMessage.prefixMatch = prefixMatch;

  // Defaults
  newMessage.replied = false;

  const replyFunction = message.reply;

  // Inject
  newMessage.reply = function (
    this: ProcessedMessage,
    ...args: Parameters<Message[`reply`]>
  ) {
    this.replied = true;
    return replyFunction.apply(this, args).catch((e) => {
      console.warn(
        `Failed to reply to message, ${newMessage.url}. Attempted to reply with`,
        args[0]
      );
      return e;
    });
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
    ): Promise<null | ProcessedMessage> {
      const message = args[0];

      // Prevent replying self
      if (message.author.id === this.user?.id) {
        return null;
      }

      // calculate prefix
      const processedMessage = preprocessMessage.call(this, message);

      const errors: { namespace: string; error: string }[] = [];

      for (const [namespace, handler] of Object.entries(handlerObj)) {
        if (!scopeAllowed(handler.scope, message.channel.type)) {
          continue;
        }

        const result = await (async () =>
          handler.exec.call(this, processedMessage))().catch((e) => {
          if (e === JustSkip) return JustSkip;
          console.error(e);
          return `internal error has occured`;
        });

        if (result === JustSkip) continue;

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

      if (processedMessage.replied) return processedMessage;

      if (errors.length === 0) {
        if (processedMessage.prefixMatch) {
          // Use context parser here to check if they are actually directing this to eliza
          // await message.reply(`I'm sorry, I don't understand your request at all`);
          console.log(
            `message was ${processedMessage.content}, but no handler was found`
          );
        }
        return processedMessage;
      }

      const sortedErrors = sortByKey(
        errors.filter((v) => v.namespace !== `help`),
        (v) => v.error.length
      );

      // It means the only error was a help error
      if (sortedErrors.length === 0) {
        await message.reply(errors[0].error);
        return processedMessage;
      }

      // continue as usual
      if (sortedErrors.length == 1) {
        await message.reply(sortedErrors[0].error);
        return processedMessage;
      }

      const errorCutoff = 3;

      await message.reply(
        sortedErrors
          .slice(0, errorCutoff)
          .map(({ namespace, error }) => `${namespace}: ${error}`)
          .join(`\n`) +
          (sortedErrors.length > errorCutoff
            ? `\n...omitted (${
                sortedErrors.length - errorCutoff
              } messages from ${toWordList(
                sortedErrors.slice(errorCutoff).map((v) => v.namespace),
                `and`
              )})`
            : ``)
      );

      return processedMessage;
    },
  };
}
