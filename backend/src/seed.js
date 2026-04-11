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
    primaryCta: "Reservar por WhatsApp",
    secondaryCta: "Descubrir más",
    scrollHint: "Desliza"
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
    ]
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
      ubicacion: "Ubicación",
      opiniones: "Opiniones",
      reservar: "Reservar"
    },
    socialLinks: [
      { key: "instagram", label: "Instagram", href: "https://www.instagram.com/", iconText: "IG" },
      { key: "airbnb", label: "Airbnb", href: "https://www.airbnb.com/", iconText: "AB" },
      { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/", iconText: "TT" }
    ]
  }
};

