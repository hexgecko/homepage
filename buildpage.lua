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
buildPage('index.html', 'home-navbar.md',  'home-content.md');
buildPage('blog.html',  'blog-navbar.md',  'blog-content.md');
buildPage('contact.html', 'contact-navbar.md', 'contact-content.md');
-------------------------------------------------------------------------------
