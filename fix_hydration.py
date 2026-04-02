f = open('C:/pablo/pablo-terminal/src/app/page.tsx', encoding='utf-8')
c = f.read()
f.close()

old = '  const { totalItems, totalFormatted, toCheckoutPayload, orderType } = useCartStore()'
new = '''  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { totalItems, totalFormatted, toCheckoutPayload, orderType } = useCartStore()'''

c = c.replace(old, new)

old2 = '  const cartCount = totalItems()'
new2 = '''  const cartCount = mounted ? totalItems() : 0'''

c = c.replace(old2, new2)
f = open('C:/pablo/pablo-terminal/src/app/page.tsx', 'w', encoding='utf-8')
f.write(c)
f.close()
print('DONE')
