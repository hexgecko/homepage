-- create a character set from a string
local set = function(str)
  local s = {};
  for i=1,#str do
    s[str:sub(i,i)] = true;
  end
  return setmetatable(s, {
    __add = function(l,r)
      local s = {}
      for k,v in pairs(l) do s[k] = v; end
      for k,v in pairs(r) do s[k] = v; end
      return s;
    end
  });
end

-- the character sets
local SET_LETTER   = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_');
local SET_MINUS    = set('-');
local SET_DIGIT    = set('0123456789.') + SET_MINUS;
local SET_NAME     = SET_LETTER + SET_DIGIT + set('-;');
local SET_SPACE    = set(' \t');
local SET_LINEFEED = set('\n\r');
local SET_PADDING  = SET_SPACE + SET_LINEFEED;
local SET_OTHER    = set('[]:;?#¤%&()*\\+|^¨~{}$£@');
local SET_QUOTE    = set('\'"');
local SET_LESS     = set('<');
local SET_GREATER  = set('>');
local SET_COMMA    = set(' \t,');
local SET_EQUAL    = set('=');
local SET_EXCL     = set('!');
local SET_SLASH    = set('/');
local SET_ATTR     = SET_LETTER + SET_DIGIT + SET_SPACE + SET_OTHER + SET_EXCL + SET_SLASH + set('{},=>`');
local SET_TEXT     = SET_ATTR + SET_QUOTE + SET_SLASH;
local SET_COMMENT  = SET_ATTR + SET_QUOTE + SET_LINEFEED;

local TOK_DOCTYPE    = 1
local TOK_TAG_BEGIN  = 2;
local TOK_TAG_CLOSE  = 3;
local TOK_TAG_END    = 4;
local TOK_ATTR_KEY   = 5;
local TOK_ATTR_VALUE = 6;
local TOK_ATTR_END   = 7;
local TOK_DATA       = 8;

local page = "";
local toklist = {};
local tok = function(k,v) table.insert(toklist, {k, v}); end
local cursor = 1;

-- move the cursor forward while it contains characters from the set,
-- return false if the first characters wasn't in the set.
local fwd = function(set)
  local b = cursor;
  
  local cmp = function(set)
    local c = page:sub(cursor, cursor);
    return set[c];
  end
  
  if cmp(set) then
    repeat
      cursor = cursor + 1;
    until not cmp(set)
    return true, page:sub(b, cursor-1);
  end
  return false;
end

-- parse any data
function parse_data()
  if fwd(SET_LINEFEED) then fwd(SET_PADDING); end
  local r,d = fwd(SET_TEXT);
  if r then tok(TOK_DATA,d); end
  return r;
end

-- parse an attribute
function parse_attribute()
  if fwd(SET_SLASH) then return 'c'; end
  if fwd(SET_SPACE) then
    if fwd(SET_SLASH) then return 'c'; end
    
    -- read the key
    local r,n = fwd(SET_NAME);
    tok(TOK_ATTR_KEY, n);
    fwd(SET_PADDING);
    fwd(SET_EQUAL)
    fwd(SET_PADDING);
    -- read the value
    fwd(SET_QUOTE); -- error
    r,n = fwd(SET_ATTR);
    tok(TOK_ATTR_VALUE, n);
    fwd(SET_QUOTE); -- error
    return true;
  end
  -- not an attribute
  return false;
end

-- parse the tag, comment or doctype
local parse_tag;
function parse_tag()
  fwd(SET_PADDING);
  if not fwd(SET_LESS) then return false; end
  if fwd(SET_SLASH) then return false; end;
  
  -- docktype or comment
  if fwd(SET_EXCL) then
    -- a comment, ignore any comment
    if fwd(SET_MINUS) then
      fwd(SET_COMMENT);
      
    -- docktype
    else
      fwd(SET_NAME);
      fwd(SET_SPACE);
      local r,n = fwd(SET_NAME);
      tok(TOK_DOCTYPE, n);
    end
    fwd(SET_GREATER);
    
  -- tag
  else
    -- read the tag anem
    local r,n = fwd(SET_NAME);
    if r then tok(TOK_TAG_BEGIN,n); end;
      
    -- read any attributes
    while true do
      r = parse_attribute();
      if r~=true then break; end
    end
    
    -- it's a closed tag.
    if r == 'c' then
      fwd(SET_GREATER);
      tok(TOK_TAG_CLOSE);
    
    -- it's an open tag
    else
      fwd(SET_GREATER);
      tok(TOK_ATTR_END);
      
      -- parse all data and tags within the tag
      while parse_data() or parse_tag() do ; end
      
      -- we have reached the end tag
      local r,n = fwd(SET_NAME);
      tok(TOK_TAG_END, n);
      fwd(SET_GREATER);
    end
  end
  return true;
end

local htmlparser_mt = {};
htmlparser_mt.__index = htmlparser_mt;

-- return the index to the first attribute
function htmlparser_mt.findAttribute(self, key, value)
  local t = self._toklist;
  for i=1,#t do
    if t[i][1] == TOK_ATTR_KEY and t[i+1][1] == TOK_ATTR_VALUE and
       t[i][2] == key          and t[i+1][2] == value then
      -- an attribute have been found, search for the next attr end or a tag close.
      for j=i,#t do
        if t[j][1] == TOK_ATTR_END or t[j][1] == TOK_TAG_CLOSE then
          return j;
        end
      end
    end
  end
end

-- append an other html token to this 
function htmlparser_mt.append(self, index, src)
  for i,v in ipairs(src._toklist) do
    index = index + 1;
    table.insert(self._toklist, index, v);
  end
end

-- write the html to a file
function htmlparser_mt.write(self, filename)
  local file = assert( io.open(filename, "w") );
  
  for _,tok in ipairs(self._toklist) do
    local k,v = tok[1],tok[2];
    
    if k == TOK_TAG_BEGIN then
      file:write("<"..v);
    elseif k == TOK_TAG_CLOSE then
      file:write("/>");
    elseif k == TOK_TAG_END then
      if v then file:write("</"..v..">"); end
    elseif k == TOK_ATTR_END then
      file:write(">");
    elseif k == TOK_ATTR_KEY then
      if v then file:write(" "..v.."="); end
    elseif k == TOK_ATTR_VALUE then
      if v then file:write("\'"..v.."\'"); end
    elseif k == TOK_DATA then
      file:write(v);
    elseif k == TOK_DOCTYPE then
      file:write("<!DOCTYPE "..v..">");
    end
  end
  
  file.close();
end

return {
  new = function(str)
    -- set the str and reset the toklist
    cursor = 1;
    page = str;
    toklist = {};
    
    -- tokanize the html
    while parse_data() or parse_tag() do ; end;
    
    -- create a object and copy it to the objects toklist
    local obj = {
      _toklist = {}
    };
    
    -- copy the toklist to the objects toklist
    for i,v in ipairs(toklist) do
      obj._toklist[i] = toklist[i];
    end
    
    return setmetatable(obj, htmlparser_mt);
  end
};
