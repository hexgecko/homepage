--[[

#License

Copyright (C) 2016 HexGecko

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.

]]


local HtmlParser = require('htmlparser');
local markdown   = require('mdparser');

-- return a string with the content of a given file
local function readFile(filename)
  local file = assert( io.open(filename));
  return file:read('*all');
end

-- build the page with the given parameters
local function buildPage(output, navbar, content)
  -- parser the template file
  local template = HtmlParser.new( readFile('template/template.html') );

  -- append the navbar and content to the template
  template:append(
    template:findAttribute('id', 'navbar'),
    HtmlParser.new(markdown.parser( readFile('markdown/' .. navbar))) );
  
  template:append(
    template:findAttribute('id', 'content'),
    HtmlParser.new(markdown.parser( readFile('markdown/' .. content))) );
  
  template:append(
    template:findAttribute('id', 'archive'),
    HtmlParser.new(markdown.parser( readFile('markdown/archive.md'))) );

  -- write the file to an html page
  template:write('output/' .. output);
end

-------------------------------------------------------------------------------
-- Builing the pages
-------------------------------------------------------------------------------
-- home
buildPage('index.html',
          'home-navbar.md',
          'home-content.md');

-- blog
buildPage('blog.html',
          'blog-navbar.md',
          'blog-content.md');

-- post: Hosting your Website on GitHub
buildPage('using-github-as-host-for-your-website.html',
          'blog-navbar.md',
          'using-github-as-host-for-your-website.md');

-- contact
buildPage('contact.html',
          'contact-navbar.md',
          'contact-content.md');
-------------------------------------------------------------------------------
