# Eliza bot

Originally monkey patched js bot, but now is more powerful

# Handler rules

handlers are applied sequentially 

If the message is replied, no other handlers will be executed

If the handler returns a string, it is a "deferred reply"

If no handler replies to the message and a deferred reply exists, it is used as the reply
