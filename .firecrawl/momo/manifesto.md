# Introducing Momo

Dec 1, 2025

Hey! This is Cailyn, the founder of Momo.

To give you a brief introduction of Momo, Momo started off as an AI chief of staff for founders back in May. To understand what kind of tasks personal assistants were doing, I worked as an assistant myself during summer break (June-September). Based on my experience, here were the few things I realized:

- founders wear a LOT of hats. the tasks they do throughout the day require so much context switching - starting the day with HR tasks, then marketing meetings, realignging goals with the sales and engineering team, having follow-ups with investors, and keeping track of current roadmaps and milestones

- as this gets worse, founders look to hire personal assistants, to help them keep track and prioritze tens to hundreds of random tasks that keep popping up

- as they look for assistants, trust and reliability issues rise - how much information should I give access to the assistant? Can I trust them with financial information?

- in most times, the founder and the assistant has to work together for at least a month to truly understand how each other works - more importantly, learning how the founder’s work style is like, what’s important for them, and rearranging or priotizing tasks based on those personal styles

- if the assistant quits, it takes another whole few months to find the right assistant, train them, and fully trust them with delegating tasks


Based on this, the first product I made was a unified inbox that aggregated gmail, slack, linkedin, whatsapp and more, while Momo, the AI agent, would keep track of these tasks and reorder them based on the user’s priority.

![](https://framerusercontent.com/images/Aq0u6djbQF4OGnV5xbkR4eAoHP4.png)

I launched this in September, but truth be told, retention was terrible, and more importantly, the backend was missing. Products like Superhuman or Fyxer work at some level with tag filtering and auto email drafts, but they’re not personalized to you. They don’t know _what’s_ important to _you_ and _why_ this email is important to you. They don’t know the context behind that email, and which other projects or conversation threads are linked to that mail.

I realized that these kind of personal assistant products would never truly work unless we properly solved the memory issue for agents.

I was set upon two paths: use existing memory tools, or build one myself.

## We decided to build our own memory connectors.

Upon researching other existing tools, I had to manually add memory contexts, and this was pretty bad user experience. There was no way users were going to manually add each email or slack message to their memory graphs.

While building Momo’s first version, one thing that was most important was creating a unified data structure for combining apps like gmail and slack - and using existing tools were unreliable unless they had a dedicated data structure for these kind of messenger platforms.

While indexing docs like Notion or Google Docs are pretty straightforward, messenging apps have a different characteristic. There are a lot more incoming events that the user can’t control, it’s hard to create structures or keep track of them as they’re evolving in real time, and they involve a lot of other people.

Thus, we decided to tackle this problem first: build connectors for these apps like gmail, slack, linear, and more that automatically builds the memory graph for you. As events come in, Momo auto extracts relevant information and goes through its consolidation layer, deciding how this event should be linked to other existing memories.

With these connectors, users are able to build a unified memory graph that consolidates all the incoming events.

![](https://framerusercontent.com/images/VTBaJyIEPXTHHrdB7ulrfuOD2w.png)

And what’s possible with this?

- No more manually adding memory: with one click connection, Momo builds the memory infrastructure and ingests real time events. These are automatically feeded into the memory, updating, inserting, and linking memories to other memory nodes.

- Project and task based knowledge graphs: Momo creates nodes based on projects, so that you can intuitively understand which projects are linked to other projects, who’s involved, and what tasks are necessary.


All in all, I’m super excited to build out the opportunities that arise as we gradually launch more memory connectors.

- a unified memory graph that knows project relationships across multiple apps like slack, linear, github, zendesk

- spotting deadlines, misalignments, and risks without having to context switch all the time and ask multiple people involved

- easily build workflow automations that has memory access to all the connected apps


We’re currently rolling out our first MVP (gmail connector) to signed up users on our waitlist. We’re also sharing research insights every week based on all the memory related papers we’re reading for RND [here](https://github.com/momo-personal-assistant/momo-research). Feel free to make a PR in that repo if you’re also researching this field, or send us any feedback or ideas you want to see implemented. Join our [discord](https://discord.com/invite/YKG6hxF2zv) server and our [waitlist](https://www.usemomo.com/) to get access!

Thanks for reading it this far.

I can’t wait to see what you would build with Momo.

[‹ Basics of Context Engineering: Session and Memory](https://www.usemomo.com/insights/context-engineering-basics)