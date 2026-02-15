
import { Leaf, WheatOff, Sprout, Beef, Salad } from "lucide-react";

export default function ShopByLifestyle() {
  const lifestyles = [
    { name: "Vegan", icon: Leaf, desc: "Bitkisel beslenme", color: "vegan" },
    { name: "Glutensiz", icon: WheatOff, desc: "Gluten içermez", color: "gluten-free" },
    { name: "Paleo", icon: Sprout, desc: "Atalardan gelen", color: "paleo" },
    { name: "Keto", icon: Beef, desc: "Düşük karbonhidrat", color: "keto" },
    { name: "Bitkisel", icon: Salad, desc: "Doğal içerik", color: "plant-based" },
  ];

  return (
    <section className="redesign-section" id="shop-by-lifestyle">
      <div className="redesign-container">
        <h2 className="redesign-title" style={{ textAlign: "center" }}>Shop By Lifestyle</h2>
        
        <div className="lifestyle__grid">
          {lifestyles.map((item) => (
            <div key={item.name} className="lifestyle__item">
              <div className={`lifestyle__icon-circle lifestyle__icon-circle--${item.color}`}>
                <item.icon />
              </div>
              <h3 className="lifestyle__name">{item.name}</h3>
              <p className="lifestyle__desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
