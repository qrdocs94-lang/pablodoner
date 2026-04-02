@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
 
@tailwind base;
@tailwind components;
@tailwind utilities;
 
:root {
  --red:       #C0392B;
  --red-dark:  #96281B;
  --red-light: #E74C3C;
  --green:     #1B5E20;
  --green-mid: #2E7D32;
  --gold:      #F39C12;
  --cream:     #FFF8F0;
  --warm:      #FDF3E3;
  --card-bg:   #FFFFFF;
  --text:      #1A1A1A;
  --muted:     #888888;
  --border:    #F0E8DC;
}
 
* { box-sizing: border-box; }
 
html { scroll-behavior: smooth; }
 
body {
  font-family: 'Nunito', sans-serif;
  background-color: var(--cream);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
 
.font-display { font-family: 'Bebas Neue', sans-serif; }
 
/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--cream); }
::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }
 
/* Category pills */
.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  background: white;
  color: var(--text);
  border-color: var(--border);
}
.cat-pill:hover { border-color: var(--red); color: var(--red); }
.cat-pill.active {
  background: var(--red);
  color: white;
  border-color: var(--red);
  box-shadow: 0 4px 12px rgba(192,57,43,0.3);
}
 
/* Product card */
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
  border-color: var(--red);
}
 
/* Add button */
.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--red);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.add-btn:hover {
  background: var(--red-dark);
  transform: scale(1.1);
}
 
/* Checkout bar */
.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}
 
.checkout-btn {
  background: var(--red);
  color: white;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 1px;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.checkout-btn:hover {
  background: var(--red-dark);
  transform: scale(1.02);
}
 
/* Mode toggle */
.mode-toggle {
  display: flex;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  padding: 4px;
  gap: 2px;
}
.mode-btn {
  padding: 8px 20px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255,255,255,0.7);
  background: transparent;
}
.mode-btn.active {
  background: var(--gold);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
 
/* Cart badge */
.cart-badge {
  background: var(--gold);
  color: var(--text);
  font-weight: 900;
  font-size: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-up { animation: slideUp 0.4s ease forwards; }
 
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fade-in { animation: fadeIn 0.3s ease forwards; }
 