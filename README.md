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
Let's say you have input elements on your page like so:

    <input id="UserPostTag0Name" name="data[User][Post][Tag][][name]" value="Fishing" type="text">
    <input id="UserPostTag1Name" name="data[User][Post][Tag][][name]" value="Dislikes" type="text">

We're probably looking at a `User` model that has many `Post` which hasBelongsToMany `Tag`s.
Here's where the user would input the name of new `Tag`s to associate with their `Post`:

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
var input0 = document.getElementById('UserPostTag0Name');
var input1 = document.getElementById('UserPostTag1Name');
var flatPathsAndKeys = {};

flatPathsAndKeys[input0.name] = input0.value;
flatPathsAndKeys[input1.name] = input1.value;

// H.expand() will create a multi-dimensional object out of path: value pairs.
// flatPathsAndKeys looks like: 
// 
// {
// 	'data[User][Post][Tag][][name]': 'Fishing',
// 	'data[User][Post][Tag][][name]': 'Dislikes',
// }
//
// Alternatively: use the dot notation syntax (preferred)
// {
// 	'User.Post.Tag.0.name': 'Fishing',
// 	'User.Post.Tag.1.name': 'Dislikes',
// }
//

H.expand(flatPathsAndKeys);

// returns:

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