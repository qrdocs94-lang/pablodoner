import re

f = open('C:/pablo/pablo-terminal/src/app/page.tsx', encoding='utf-8')
c = f.read()
f.close()

old = '''  {/* Image / Emoji area */}
      <div className="h-28 bg-gradient-to-br from-[#F5E6D0] to-[#E8C99A] flex items-center justify-center text-5xl">
        🌯
      </div>'''

new = '''  {/* Image / Emoji area */}
      <div className="h-32 bg-gradient-to-br from-[#F5E6D0] to-[#E8C99A] flex items-center justify-center text-6xl relative overflow-hidden">
        <span className="transform group-hover:scale-110 transition-transform duration-200">
          {product.options_schema && JSON.stringify(product.options_schema).includes('sauce') ? '🌯' :
           product.name.toLowerCase().includes('falafel') ? '🧆' :
           product.name.toLowerCase().includes('lahmacun') ? '🫓' :
           product.name.toLowerCase().includes('pommes') ? '🍟' :
           product.name.toLowerCase().includes('nuggets') ? '🍗' :
           product.name.toLowerCase().includes('wurst') ? '🌭' :
           product.name.toLowerCase().includes('cola') || product.name.toLowerCase().includes('fanta') ? '🥤' :
           product.name.toLowerCase().includes('ayran') ? '🥛' :
           product.name.toLowerCase().includes('salat') ? '🥗' :
           product.name.toLowerCase().includes('halloumi') ? '🧀' :
           product.name.toLowerCase().includes('teller') ? '🍽️' :
           product.name.toLowerCase().includes('toast') ? '🍞' :
           product.name.toLowerCase().includes('mozzarella') ? '🧀' :
           '🌯'}
        </span>
      </div>'''

c = c.replace(old, new)
f = open('C:/pablo/pablo-terminal/src/app/page.tsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('DONE')
