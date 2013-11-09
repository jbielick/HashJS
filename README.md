#hashjs

====================
A CakePHP class Hash-like javascript object traversal, manipulation and extraction tool.

This is not xpath for javascript. It's simple, focused on combining, extracting, inserting, and translating data paths in javascript objects.

####Install
=========================
Use as a front-end tool:

    git clone git@github.com:jbielick/HashJS.git

and include hash.min.js on your page.

or

Install as a node module with npm:

    npm install hashjs
	 
####Examples:
=========================
Let's say you have an input element on your page like so:

We're probably looking at a `User` model that has many `Post` which hasBelongsToMany `Tag`s.
Here's where the user would input the name of new `Tag`s to associate with their `Post`:

    <input id="UserPostTag0Name" name="data[User][Post][Tag][][name]" value="Fishing" type="text">
    <input id="UserPostTag0Name" name="data[User][Post][Tag][][name]" value="Dislikes" type="text">

Javascrit doesn't understand the form-encoded syntax for representing multidimensional input structures.
The previous input element would yield a structure like the following in PHP or the like:

```php
array(
	'User' => array(
		'Post' => array(
			'Tag' => array(
				0 => array(
					'name' => 'News'
				),
				1 => array(
					'name' => 'Dislikes'
				)
			)
		)
	)
)
```
That's really helpful. Thanks, PHP. 
Want this structure in javascript?

```javascript
var input = document.getElementById('UserPostCategory0Name');
var name = input.getAttribute('name');

// expand this

H.expand(name, input.value);

// looks like: H.expand('data[User][Post][Tag][][name]', 99)
// and the result:

{
	User: {
		Post: {
			Tag: [{
				name: 'News'
			},{
				name: 'Dislikes'
			}]
		}
	}
}
```