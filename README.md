# whoshiring
Welcome to "woshiring", a browser for Hacker News's monthly Ask HN: Who's Hiring pages built atop the Matrix mxWeb&trade; web application un-framework. (It is just a thin, pass-through wrapper for HTML, CSS, JS, and AJAX.)

### Running it yourself
Easy.
````bash
git clone https://github.com/kennytilton/whoshiring.git
````
Now open `whoshiring/index-es6.html` in FireFox. Other browsers refuse to deal with HN pages being pulled into an `iframe` for scraping.

You can now play with the source*, save, and refresh the page back in the browser. That is how I work, FWIW.

#### Staying current
The app works by scraping saved HN page sources. The files directory has a subdirectory for each HN message ID in which they ask Who's Hiring. That subirectory has multiple HTML files retrieved with the additional query parameter `p=<n>` where `<n>` is 1 to however many pages of answers (job listings) they have. They do about 200 jobs per page, and recently had about 870 jobs all told. Anyway...

To refresh your page data:
````bash
cd whoshiring
./grab
````
More soon.

#### * No, you cannot (play with the source)

mxWeb is simple, but only after we have grokked the data flow library Matrix&trade; on which it is built. Matrix is like [MobX](https://github.com/mobxjs/mobx), but goes a bit further. We find the [Binding.scala](https://github.com/ThoughtWorksInc/Binding.scala) data flow library impressive as well.

Matrix is largely undocumented**, though there are an extensive number of sample apps, including this one, TodoMVC, The Flux Challenge, and a simulator of Ivan Sutherland's Micropipelines.

### Going minimal
To compile the JS into a single file, use the epinymous bash script at the toplevel of the directory:
````
cd whoshiring
./whoshiring
````
Now open `index.html`, again in FireFox. 

### ** Undocumented, but not unexplained
My latest attempt to explain mxWeb is a wonderfully elaborate [CodePen application](https://codepen.io/kennytilton/pen/mXQNYR)  within an application, both built from mxWeb. The larger app presents the incremental evolution of about half of TodoMVC and a bit more, using mxXHR&trade; to check items for adverse events on an NIH web site. 

It is a solid write-up, but the point emphasized was the transparency of the data flow mechanism, and transparency is hard to see. What might help is a recent write-up of [how we stumbled onto data flow](http://smuglispweeny.blogspot.com/2017/06/the-making-of-cells-case-study-in-dumb.html), including how we made it transparent.

## More soon
More soon.

