export const DEFAULT_SECTIONS = {
  hero: {
    tag: "Trinidad, Cuba · Patrimonio vivo",
    title: "Vive la auténtica experiencia cubana en Trinidad",
    lead:
      "Bienvenido a Casa Trinidad Viva, un espacio acogedor en el corazón de Trinidad donde podrás disfrutar de la cultura, la historia y la calidez cubana.",
    whatsappUrl:
      "https://wa.me/5351234567?text=Hola%2C%20me%20interesa%20reservar%20en%20Casa%20Trinidad%20Viva",
    bgImageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&q=85",
    bgAlt: "Playa tropical y mar turquesa",
    primaryCta: "Reservar",
    secondaryCta: "Descubrir más",
    scrollHint: "Desliza",
    /** Textos en inglés opcionales (la web en /en los fusiona con el español). */
    i18n: {
      en: {
        tag: "Trinidad, Cuba · Living heritage",
        title: "Experience authentic Cuban hospitality in Trinidad",
        lead:
          "Welcome to Casa Trinidad Viva, a welcoming space in the heart of Trinidad where you can enjoy culture, history, and Cuban warmth.",
        primaryCta: "Book",
        secondaryCta: "Discover more",
        scrollHint: "Scroll",
        bgAlt: "Tropical beach and turquoise sea"
      }
    }
  },
  /** Bloque «Bienvenida» bajo el hero: imagen + texto y enlace a la guía del viajero. */
  homeIntro: {
    enabled: true,
    title: "Bienvenida a nuestra casa en Trinidad",
    summary: [
      "Casa Trinidad Viva es una casa particular en el centro histórico de Trinidad, Patrimonio de la Humanidad. Vivimos aquí: conocemos el empedrado, el calor del valle y los atajos para llegar a la escalinata o al casco sin perderse. Priorizamos habitaciones frescas, baño privado y un patio donde charlar al volver de la playa o de un concierto al aire libre.",
      "Reservar con nosotros es trato directo: te orientamos con mapas sencillos, desayunos de verdad y consejos honestos sobre museos, música en vivo, Topes de Collantes o una tarde en Playa Ancón. Un buen viaje empieza con información clara — en nuestra guía del viajero reunimos temporada, transporte y costumbres locales para que llegues con buen pie."
    ],
    guideCtaLabel: "Ver guía del viajero",
    imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    alt: "Interior de casa colonial con luz natural",
    i18n: {
      en: {
        title: "Welcome to our home in Trinidad",
        summary: [
          "Casa Trinidad Viva is a casa particular in Trinidad’s UNESCO-listed historic centre. We live here: we know the cobblestones, the valley heat, and the shortcuts to the stairway and old town. We focus on cool rooms, private bathrooms, and a patio to unwind after the beach or an open-air concert.",
          "Booking with us is a direct conversation: real breakfasts, simple maps, and honest tips on museums, live music, Topes de Collantes, or an afternoon at Playa Ancón. A good trip starts with clear information — our travel guide brings together season, transport, and local customs so you arrive on the right foot."
        ],
        guideCtaLabel: "Open the travel guide",
        alt: "Colonial house interior with natural light"
      }
    }
  },
  /** Página /guia-del-viajero · /en/travel-guide */
  travelGuide: {
    pageH1: "Guía práctica para visitar Trinidad",
    pageLead: "",
    pageSeoTitle: "Guía del viajero | Trinidad, Cuba — Casa Trinidad Viva",
    cover: {
      imgUrl: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?w=1400&q=80",
      alt: "Calles coloniales de Trinidad al atardecer",
      caption: "Trinidad, Cuba · Centro histórico",
    },
    photos: [
      {
        imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80",
        alt: "Playa de arena y mar turquesa",
        caption: "Playa Ancón",
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1400&q=80",
        alt: "Valle verde cerca de Trinidad",
        caption: "Valle de los Ingenios",
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80",
        alt: "Mochila y mapa de viaje en una mesa",
        caption: "Consejos prácticos para planificar",
      },
    ],
    pageBlocks: [
      "Trinidad combina clima tropical de montaña y costa: diciembre a abril suele ser más seco y fresco por la noche; mayo a noviembre trae lluvias cortas pero intensas. Empaca capa ligera impermeable, calzado cerrado antideslizante para empedrado mojado y protección solar alta. Un pañuelo o sombrero de ala ancha vale más que tres cremas después de una quemadura.",
      "Llegar en autobús Víazul desde La Habana o Varadero es económico pero largo; reserva asientos con antelación en temporada alta. En taxi privado negocia precio fijo por trayecto completo, incluido peajes si aplican. Desde Cienfuegos el tramo es corto y panorámico; ideal si vienes en coche de alquiler con GPS offline descargado.",
      "En la ciudad caminar es el mejor modo de descubrir miradores escondidos, pero las cuestas castigan rodillas: usa bastón plegable si lo necesitas y planifica pausas en patios con sombra. Los coches eléctricos turísticos pueden ahorrar tiempo si vas con niños pequeños o mucho calor extremo.",
      "El cambio de moneda fluctúa; lleva efectivo en euros o dólares canadienses además de tarjetas. Pregunta en recepción por tasas del día y dónde retirar con menor cola. Evita cambiar con desconocidos en la calle: arriesgas billetes falsos o tasas desleales.",
      "La gastronomía va de casas particulares con menú del día a paladares gourmet. Pide siempre precio antes de pedir langosta o langostino en temporada turística. El café en aguas de casa suele ser más fuerte que en cadenas internacionales: diluye con leche caliente si prefieres suavidad.",
      "Para Playa Ancón, combina taxi de ida con regreso en bicitaxi o guagua si quieres ahorrar. Lleva agua doble cantidad de la que crees necesaria y snack salado: el sol reflejado en la arena agota rápido. Ducha al volver antes de siesta evita golpes de calor.",
      "Cinco ideas rápidas: (1) sube la torre del Museo de Historia Municipal al atardecer para luz cálida; (2) reserva concierto en Casa de la Música con margen de llegada; (3) visita Valle de los Ingenios temprano para niebla fotogénica; (4) prueba miel de caña local con queso campesino; (5) respeta códigos de vestimenta en iglesias activas.",
      "Si viajas solo, únete a tours grupales reducidos para Topes de Collantes: compartes coste de guía y transporte. Si viajas en pareja, un taxi privado te da flexibilidad de paradas fotográficas. Pregunta siempre si el vehículo tiene aire acondicionado funcional en verano.",
      "La etiqueta local valora el saludo cordial, la paciencia en colas y propinas modestas en servicios directos (maleteros, músicos en mesa). No filmes a personas mayores sin permiso en mercados: algunas prefieren privacidad.",
      "Antes de marcharte, revisa ventanas y enchufes: la humedad tropical a veces hincha puertas. Si olvidas un cargador, lo guardamos meses en caja de objetos perdidos etiquetados. Queremos que la última impresión sea tan cuidada como la primera."
    ],
    i18n: {
      en: {
        pageH1: "Practical guide to visiting Trinidad",
        pageLead: "",
        pageSeoTitle: "Travel guide | Trinidad, Cuba — Casa Trinidad Viva",
        cover: {
          alt: "Colonial streets in Trinidad at sunset",
          caption: "Trinidad, Cuba · Historic centre",
        },
        photos: [
          { alt: "Sandy beach and turquoise sea", caption: "Playa Ancón" },
          { alt: "Green valley near Trinidad", caption: "Valle de los Ingenios" },
          { alt: "Backpack and map on a table", caption: "Practical planning tips" },
        ],
        pageBlocks: [
          "Trinidad blends mountain and coast tropical weather: December through April tends to be drier and cooler at night; May through November brings short but intense showers. Pack a light rain shell, closed non-slip shoes for wet cobblestones, and high SPF protection. A scarf or wide-brim hat beats three tubes of cream after a sunburn.",
          "Arriving by Víazul bus from Havana or Varadero is affordable but long; book seats early in high season. With a private taxi negotiate a fixed price for the full ride, including tolls if any. From Cienfuegos the hop is short and scenic—ideal if you rent a car with offline GPS downloaded.",
          "Walking is the best way to discover hidden viewpoints, but hills are hard on knees: use a folding stick if needed and plan shade breaks. Tourist electric carts can save time with small children or extreme heat.",
          "Exchange rates fluctuate; carry cash in euros or Canadian dollars plus cards. Ask us for same-day guidance and shorter ATM queues. Avoid street money changers: you risk fake bills or unfair rates.",
          "Food ranges from casa menus of the day to gourmet paladares. Always confirm price before ordering lobster or prawns in high season. Coffee at homes is often stronger than international chains—dilute with hot milk if you prefer it milder.",
          "For Playa Ancón, combine a taxi out with a return by bike taxi or local bus if you want to save. Carry twice the water you think you need and a salty snack: reflected sand sun drains you fast. Showering after returning, before a siesta, helps avoid heat spikes.",
          "Five quick ideas: (1) climb the Municipal History Museum tower near sunset for warm light; (2) book Casa de la Música with arrival margin; (3) visit Valle de los Ingenios early for misty photos; (4) try local sugarcane honey with farm cheese; (5) respect dress codes in active churches.",
          "If you travel solo, join small-group tours to Topes de Collantes to share guide and transport costs. As a couple, a private taxi gives flexibility for photo stops. Always ask whether the vehicle has working air conditioning in summer.",
          "Local etiquette values a warm greeting, patience in queues, and modest tips for direct services (porters, table musicians). Do not film elderly vendors in markets without permission—some prefer privacy.",
          "Before departure, check windows and plugs: tropical humidity sometimes swells doors. If you forget a charger, we keep a labelled lost-and-found for months. We want your last impression to be as careful as the first."
        ]
      }
    }
  },
  /** Página /sobre-nosotros · /en/about */
  aboutPage: {
    pageH1: "Nuestra historia y por qué Trinidad",
    pageLead: "",
    pageSeoTitle: "Sobre nosotros | Casa Trinidad Viva — Trinidad, Cuba",
    cover: {
      imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
      alt: "Interior de casa colonial con luz natural",
      caption: "Casa Trinidad Viva · Hospitalidad familiar",
    },
    photos: [
      {
        imgUrl: "https://images.unsplash.com/photo-1615876239416-43f70512e548?w=1400&q=80",
        alt: "Detalle acogedor de una habitación",
        caption: "Espacios pensados para descansar",
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=80",
        alt: "Baño limpio y luminoso",
        caption: "Baño privado",
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1400&q=80",
        alt: "Mar tropical y playa cerca de Trinidad",
        caption: "Costa sur de Cuba",
      },
    ],
    pageBlocks: [
      "Casa Trinidad Viva nació de la decisión de compartir nuestro hogar con viajeros curiosos, no solo de pasar una noche más en una ciudad postal. Trinidad nos eligió tanto como nosotros a ella: el contraste entre el silencio del valle y la música espontánea en las plazas, el mar cercano y la montaña verde, hace que cada semana sea distinta según festivales, lluvias o mercados de fin de semana.",
      "Antes de abrir formalmente la casa particular, viajamos por Europa y América Latina entendiendo qué hace memorable un alojamiento: camas firmes, duchas predecibles, desayunos honestos y dueños que escuchan. Aplicamos esa brújula aquí, donde la logística puede ser impredecible y la creatividad cotidiana marca la diferencia.",
      "Creemos en el turismo que distribuye beneficios: recomendamos artesanos locales, músicos independientes y proyectos comunitarios de conservación. Cuando un huésped compra una pieza de barro en el taller vecino o deja propina directa a la banda, la economía circular del pueblo se refuerza.",
      "Nuestro equipo familiar pequeño alterna recepción, cocina y mantenimiento; no subcontratamos limpieza opaca. Así controlamos calidad y trato. Si algo falla —un grifo que gotea, un ventilador ruidoso— lo reparamos con prioridad porque dormir bien es el núcleo del servicio.",
      "Trinidad es sensible al cambio climático y al flujo masivo de visitantes en temporada alta. Por eso educamos sobre consumo de agua, uso racional de aire acondicionado cuando existe, y respeto por fachadas históricas (no tocar cal fresca, no dejar basura en callejones estrechos).",
      "Colaboramos con guías licenciados cuando el itinerario lo requiere, pero también disfrutamos caminar con huéspedes una mañana libre mostrando el mercado real, no solo la vitrina turística. Esa mezcla define nuestra personalidad: formalidad cuando hace falta, cercanía siempre.",
      "Si te quedas más de tres noches, armamos un microplan de días alternando cultura, naturaleza y descanso para no saturar. Preferimos que salgas con energía y buenos recuerdos a que marques diez museos en 48 horas sin disfrutar ninguno."
    ],
    i18n: {
      en: {
        pageH1: "Our story and why Trinidad",
        pageLead: "",
        pageSeoTitle: "About us | Casa Trinidad Viva — Trinidad, Cuba",
        cover: {
          alt: "Colonial house interior with natural light",
          caption: "Casa Trinidad Viva · Family hospitality",
        },
        photos: [
          { alt: "Cozy room detail", caption: "Spaces made for rest" },
          { alt: "Clean, bright bathroom", caption: "Private bathroom" },
          { alt: "Tropical sea and beach near Trinidad", caption: "Cuba’s south coast" },
        ],
        pageBlocks: [
          "Casa Trinidad Viva was born from the decision to share our home with curious travellers, not just to add another overnight stay in a postcard town. Trinidad chose us as much as we chose it: the contrast between valley silence and spontaneous plaza music, the nearby sea and green mountains, makes every week different depending on festivals, rains, or weekend markets.",
          "Before opening formally as a casa particular, we travelled through Europe and Latin America learning what makes a stay memorable: firm beds, predictable showers, honest breakfasts, and hosts who listen. We apply that compass here, where logistics can be unpredictable and everyday creativity makes the difference.",
          "We believe in tourism that spreads benefits: we recommend local artisans, independent musicians, and community conservation projects. When a guest buys pottery at the neighbour’s workshop or tips the band directly, the town’s circular economy grows stronger.",
          "Our small family team rotates reception, cooking, and maintenance; we do not outsource opaque cleaning. That is how we control quality and tone. If something fails—a dripping tap, a noisy fan—we repair it quickly because good sleep is the core of the service.",
          "Trinidad is sensitive to climate change and peak visitor flows. That is why we educate about water use, rational air-conditioning when available, and respect for historic façades (do not touch fresh lime render, do not litter narrow alleys).",
          "We work with licensed guides when the itinerary requires it, but we also enjoy a free morning walk with guests through the real market, not only the tourist window. That mix defines our personality: formality when needed, warmth always.",
          "If you stay more than three nights, we sketch an alternating plan of culture, nature, and rest so you do not burn out. We prefer you leave energised with good memories than ticking ten museums in 48 hours without enjoying any of them."
        ]
      }
    }
  },
  experiences: {
    eyebrow: "Experiencias",
    title: "Vive Trinidad como un local",
    lead: "No solo ofrecemos alojamiento, también te ayudamos a vivir experiencias únicas:",
    list: [
      "Excursiones al Valle de los Ingenios",
      "Visitas a Playa Ancón",
      "Clases de cocina cubana",
      "Música en vivo y cultura local",
      "Recomendaciones personalizadas"
    ],
    tagline: "Queremos que tu viaje sea inolvidable.",
    cards: [
      {
        imgUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
        alt: "Paisaje del valle con montañas y vegetación",
        title: "Valle de los Ingenios",
        body: "Patrimonio, naturaleza e historia del azúcar: te ayudamos a organizar la excursión que mejor encaje contigo."
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        alt: "Playa tropical con arena y mar turquesa",
        title: "Playa Ancón",
        body: "Mar cálido y arena para un día de playa sin complicaciones: consejos de transporte y qué llevar."
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80",
        alt: "Platos típicos de cocina cubana en la mesa",
        title: "Cocina y cultura",
        body: "Clases de cocina, música en vivo y callejuelas con alma: Trinidad se vive con todos los sentidos."
      }
    ]
  },
  split: {
    title: "Todo lo que necesitas",
    ctaLabel: "Ir a reservas",
    imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    alt: "Interior de casa colonial con luz natural",
    amenities: [
      "Conexión Wi‑Fi para compartir tus mejores momentos",
      "Agua fría y caliente, comodidad y limpieza cada día",
      "Ropa de cama y toallas incluidas",
      "Consejos para taxis, excursiones y la vida en Trinidad",
      "Trato familiar: te sentirás como un invitado más de la casa"
    ],
    pageH1: "Servicios y comodidades",
    pageLead: "",
    pageSeoTitle: "Servicios | Casa Trinidad Viva — Trinidad, Cuba",
    pageBlocks: [
      "El desayuno cubano en Casa Trinidad Viva es abundante: fruta de temporada, pan recién tostado, huevos a la preferencia del día, café recién colado y jugos naturales cuando el mercado lo permite. Lo servimos en el patio o en el comedor interior según la temperatura. Si tienes alergias o dieta vegetariana, avísanos con 48 h de antelación para adaptar ingredientes dentro de lo disponible localmente.",
      "La conectividad a Internet en Cuba depende de tarjetas NAUTA y de la congestión de la red nacional. En la casa facilitamos orientación para comprar tarjetas y zonas con mejor señal; algunos espacios del patio suelen tener recepción más estable que el interior de muros gruesos coloniales. No prometemos fibra simétrica, sí honestidad sobre qué esperar y cómo optimizar tus videollamadas breves.",
      "Ayudamos a gestionar taxis colectivos o privados hacia Cienfuegos, El Nicho o La Habana, siempre con precios transparentes acordados antes de subir al vehículo. También recomendamos bicicletas de alquiler para trayectos cortos si dominas el terreno empedrado y el calor. Para Playa Ancón, comparamos opciones de taxi vs bus local según hora y presupuesto.",
      "Guardamos equipaje, prestamos mapas impresos y marcamos en ellos museos, miradores y cajeros automáticos funcionales. Si te interesa la fotografía nocturna de las calles coloniales, sugerimos rutas seguras y horarios concurridos donde es más cómodo transitar con trípode.",
      "Ofrecemos agua filtrada o hervida para rellenar tu botella reutilizable, reduciendo plástico de un solo uso. En la zona hay tiendas estatales y mercados agropecuarios; te explicamos cómo leer precios en CUP y cómo combinar efectivo con tarjetas internacionales donde acepten.",
      "Si celebras aniversario u ocasión especial, coordinamos flores locales, pastel pequeño o reserva en paladar con anticipación. No cobramos comisión por el gesto: solo organizamos con proveedores de confianza.",
      "La seguridad es conversación abierta: Trinidad es relativamente tranquila para caminar de día, pero recomendamos no ostentar objetos de valor y usar bolsos cruzados en zonas muy turísticas. En la casa hay candados de calidad en puertas exteriores y recomendaciones de caja fuerte.",
      "Para familias, disponemos de adaptaciones lúdicas sencillas: juegos de mesa, libros ilustrados sobre fauna cubana y sugerencias de talleres de cerámica locales. Queremos que los niños también entiendan el contexto histórico de la ciudad sin aburrirse."
    ],
    i18n: {
      en: {
        title: "Everything you need",
        ctaLabel: "Go to bookings",
        alt: "Colonial house interior with natural light",
        amenities: [
          "Wi‑Fi to share your best moments",
          "Hot and cold water, comfort and cleanliness every day",
          "Bed linen and towels included",
          "Tips for taxis, excursions, and life in Trinidad",
          "A family welcome—you’ll feel like one more guest in the house"
        ],
        pageH1: "Services and amenities",
        pageLead: "",
        pageSeoTitle: "Services | Casa Trinidad Viva — Trinidad, Cuba",
        pageBlocks: [
          "Breakfast at Casa Trinidad Viva is generous: seasonal fruit, freshly toasted bread, eggs cooked to preference, freshly brewed coffee, and natural juices when the market allows. We serve in the patio or indoor dining depending on the temperature. If you have allergies or a vegetarian diet, tell us 48 hours ahead so we can adapt ingredients within what is locally available.",
          "Internet connectivity in Cuba relies on NAUTA cards and national network congestion. We explain how to buy cards and where signal is strongest; some patio corners often receive a more stable signal than thick colonial interior walls. We do not promise symmetric fibre; we do promise honest expectations and tips for short video calls.",
          "We help arrange shared or private taxis to Cienfuegos, El Nicho, or Havana, always with transparent prices agreed before you board. We also recommend bicycle rentals for short trips if you are comfortable with cobblestones and heat. For Playa Ancón we compare taxi versus local bus options by time and budget.",
          "We store luggage, lend printed maps, and mark museums, viewpoints, and working ATMs. If you enjoy night photography on colonial streets, we suggest safe routes and busier times for walking with a tripod.",
          "We provide filtered or boiled water to refill your reusable bottle, reducing single-use plastic. There are state shops and farmers’ markets nearby; we explain how to read prices in CUP and how to combine cash with international cards where accepted.",
          "If you celebrate an anniversary or special occasion, we coordinate local flowers, a small cake, or a paladar reservation in advance. We do not charge a commission for the gesture—only organise with trusted suppliers.",
          "Safety is an open conversation: Trinidad is relatively calm by day, but we advise against flashing valuables and recommend cross-body bags in very touristy areas. The house has quality locks on exterior doors and a safe recommendation.",
          "For families we keep simple playful extras: board games, illustrated books on Cuban fauna, and suggestions for local pottery workshops. We want children to understand the town’s history without getting bored."
        ]
      }
    }
  },
  rooms: {
    title: "Habitaciones cómodas y privadas",
    subtitle: "Ofrecemos habitaciones confortables, ideales para parejas, viajeros solos o familias.",
    cards: [
      {
        imgUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        alt: "Habitación privada con cama doble y luz natural",
        title: "Parejas",
        body: "Habitación privada y acogedora para disfrutar Trinidad a dos, con todo el confort que merecéis.",
        badge: "Más solicitada"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        alt: "Habitación individual cómoda y luminosa",
        title: "Viajero solo",
        body: "Espacio íntimo y tranquilo para quien viaja solo: descansa, trabaja o planifica tu ruta con calma."
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
        alt: "Terraza y habitación luminosa apta para familias",
        title: "Familias",
        body: "Capacidad y comodidad para venir con niños o en grupo, sin renunciar a baño privado y descanso."
      }
    ],
    pageH1: "Habitaciones en el corazón de Trinidad",
    pageLead: "Baño privado, ropa de cama y consejos locales: te contamos cómo son los espacios antes de reservar.",
    pageSeoTitle: "Habitaciones | Casa Trinidad Viva — Trinidad, Cuba",
    pageItems: [
      {
        title: "Habitación doble",
        body:
          "Espacio de aproximadamente 18–22 m² con cama matrimonial o dos camas bajo petición, baño privado con agua caliente y ventilación natural. Ideal para parejas que buscan tranquilidad tras recorrer el empedrado.\n\nVentanas orientadas al patio interior para noches más frescas; mesitas, perchero y enchufes cerca de la cama para cargar dispositivos.",
        images: [
          {
            imgUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=80",
            alt: "Habitación doble con luz natural",
          },
          {
            imgUrl: "https://images.unsplash.com/photo-1615876239416-43f70512e548?w=1000&q=80",
            alt: "Detalle de cama y textiles",
          },
        ],
      },
      {
        title: "Habitación individual y triple",
        body:
          "Para viajero solo ofrecemos una habitación íntima y silenciosa. Para grupos pequeños valoramos configuración triple según disponibilidad.\n\nEn todos los casos confirmamos tipo de cama, escalones internos si los hay y presión de agua en horario punta para que no haya sorpresas.",
        images: [
          {
            imgUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80",
            alt: "Habitación individual luminosa",
          },
          {
            imgUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80",
            alt: "Baño privado renovado",
          },
          {
            imgUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80",
            alt: "Perchero y detalle de habitación",
          },
        ],
      },
    ],
    i18n: {
      en: {
        pageH1: "Rooms in the heart of Trinidad",
        pageLead: "Private bathrooms, linen included, and local tips—we describe the spaces before you book.",
        pageSeoTitle: "Rooms | Casa Trinidad Viva — Trinidad, Cuba",
        pageItems: [
          {
            title: "Double room",
            body:
              "Around 18–22 m² with a double bed or two singles on request, private bathroom with hot water, and natural ventilation. Ideal for couples who want calm after walking the cobblestones.\n\nWindows face the inner patio for cooler nights; bedside tables, wardrobe, and sockets near the bed.",
            images: [{ alt: "Double room with natural light" }, { alt: "Bed and linen detail" }],
          },
          {
            title: "Single and triple rooms",
            body:
              "Solo travellers get a quiet, intimate room. For small groups we can arrange a triple layout when the calendar allows.\n\nWe confirm bed types, any steps inside the room, and water pressure at peak times so there are no surprises.",
            images: [{ alt: "Bright single room" }, { alt: "Renovated private bathroom" }, { alt: "Wardrobe detail" }],
          },
        ],
      },
    },
  },
  /** Galería de fotos del hostal y alrededores (lightbox en la web pública). */
  gallery: {
    eyebrow: "Galería",
    title: "Momentos en Casa Trinidad Viva",
    lead: "Un vistazo a los espacios, el ambiente y Trinidad.",
    photos: [
      {
        imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80",
        alt: "Patio colonial con plantas y luz natural",
        caption: "Patio y zona común"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=80",
        alt: "Habitación acogedora con cama y ventana",
        caption: "Habitaciones"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&q=80",
        alt: "Desayuno y mesa preparada",
        caption: "Desayunos"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1000&q=80",
        alt: "Valle verde cerca de Trinidad",
        caption: "Alrededores · Valle de los Ingenios"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80",
        alt: "Playa con mar turquesa",
        caption: "Playa Ancón"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&q=80",
        alt: "Mar caribeño al atardecer",
        caption: "Caribe"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80",
        alt: "Fachada colonial con ventanas de madera",
        caption: "Fachada"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1000&q=80",
        alt: "Terraza con plantas y mesa al aire libre",
        caption: "Terraza"
      },
      {
        imgUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1000&q=80",
        alt: "Calles empedradas del centro histórico",
        caption: "Trinidad · Calles"
      }
    ]
  },
  location: {
    title: "Ubicación privilegiada",
    lead: "Nos encontramos a pocos minutos de los principales atractivos turísticos:",
    attractions: [
      {
        text: "Plaza Mayor de Trinidad",
        imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
        alt: "Arquitectura colonial en Trinidad"
      },
      {
        text: "Valle de los Ingenios",
        imgUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&q=80",
        alt: "Paisaje del valle con montañas"
      },
      {
        text: "Playa Ancón",
        imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
        alt: "Playa tropical con mar turquesa"
      }
    ],
    closing: "Podrás recorrer la ciudad caminando y descubrir su encanto colonial.",
    bgImageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80"
  },
  /** Punto principal (hostal) + lista extensible de lugares cercanos para el mapa. */
  map: {
    title: "Mapa del entorno",
    lead: "Tu alojamiento y lugares cercanos que puedes visitar.",
    defaultZoom: 15,
    main: {
      lat: 21.8058,
      lng: -79.9825,
      name: "Casa Trinidad Viva",
      description: "Hostal · centro histórico",
      imgUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80"
    },
    nearby: [
      {
        lat: 21.8045,
        lng: -79.9842,
        name: "Plaza Mayor de Trinidad",
        note: "A pocos minutos a pie"
      },
      {
        lat: 21.8031,
        lng: -79.9855,
        name: "Iglesia Parroquial",
        note: "",
        imgUrl: "https://images.unsplash.com/photo-1431274172761-fca41d869294?w=400&q=80"
      },
      { lat: 21.7385, lng: -79.8568, name: "Playa Ancón", note: "En taxi o excursión" }
    ]
  },
  testimonials: {
    eyebrow: "Opiniones",
    title: "Lo que dicen nuestros huéspedes",
    guestBadge: "Huésped",
    carouselLabel: "Opiniones de huéspedes",
    items: [
      "«Una experiencia increíble, nos sentimos como en casa desde el primer momento.»",
      "«Ubicación perfecta y atención excelente.»",
      "«Habitaciones limpias y desayuno delicioso. Volveremos sin duda.»",
      "«El patio es un oasis: ideal para descansar después de recorrer Trinidad.»",
      "«Nos ayudaron con recomendaciones de restaurantes y taxis. Muy atentos.»"
    ]
  },
  cta: {
    eyebrow: "Reservas",
    title: "Reserva fácilmente",
    lead:
      "Consulta disponibilidad y precios: envíanos el formulario con tus fechas y número de personas y te responderemos pronto.",
    imgUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=900&q=80",
    alt: "Personas disfrutando la playa al atardecer"
  },
  /** Bloque AdSense entre contacto y pie; desactivado hasta configurar IDs reales. */
  ads: {
    enabled: false,
    label: "Publicidad",
    adClient: "",
    adSlot: ""
  },
  site: {
    brandName: "Casa Trinidad Viva",
    tagline: "Tu casa en el corazón de Trinidad, Cuba.",
    navLabels: {
      experiencia: "Experiencia",
      habitaciones: "Habitaciones",
      galeria: "Galería",
      ubicacion: "Ubicación",
      opiniones: "Opiniones",
      reservar: "Reservar"
    },
    socialLinks: [
      { key: "instagram", label: "Instagram", href: "https://www.instagram.com/", iconText: "IG" },
      { key: "airbnb", label: "Airbnb", href: "https://www.airbnb.com/", iconText: "AB" },
      { key: "booking", label: "Booking.com", href: "https://www.booking.com/", iconText: "B." },
      { key: "tripadvisor", label: "TripAdvisor", href: "https://www.tripadvisor.com/", iconText: "TA" },
      { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/", iconText: "TT" }
    ]
  }
};

