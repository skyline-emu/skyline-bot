# Skyline Bot
We needed a bot for managing our Discord Server with specific features. So, we could effectively moderate and help people in an efficient manner and meet the special needs of managing an emulation server with potential for integration with the application in the future.
## Outline
### Events
These are any events emitted by the Discord API that are visible to the bot such as:
* Reaction to a message (`messageReactionAdd`/`messageReactionRemove`)
* Successful connection with the Discord API (`ready`)
* Sending a message (`message`)
### Filters
These are implemented as a message event, functions that are run for every single message that the bot recieves. They are executed in a specific order depending on their priority, if a filter from a higher priority decides to "consume" a message then it'll never reach a lower priority filter.
### Commands
These are implemented as a filter, they look for messages with a specific prefix to extract data about a fixed format command from them. A command can have a specific access level and have special behavior for errors that occur during them.