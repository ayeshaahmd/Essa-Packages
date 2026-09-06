import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Factory,
  Layers3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  Ruler,
  ShieldCheck,
  Sparkles,
  Upload,
  X
} from 'lucide-react';

const WHATSAPP_NUMBER = '923452801957';
const PHONE_DISPLAY = '0345 2801957';
const EMAIL = 'imran.essapackages@gmail.com';
const LOCATION_ADDRESS = 'Plot No. B-81, Sector 11-E, New Fatima Jinnah Colony, Near Godra, North Karachi';
const MAP_DIRECTIONS_URL = 'https://maps.app.goo.gl/Jx7EcbCt53zRR4Vo6';
const MAP_EMBED_URL = 'https://www.google.com/maps?q=24.969318,67.076794&z=17&output=embed';

const solutions = [
  {
    id: 'fancy-cartons',
    eyebrow: 'Shelf-ready presentation',
    name: 'Fancy Cartons',
    benefit: 'Elevated printed packaging that helps products feel considered and retail-ready.',
    bestFor: 'Cosmetics · Food · Gifts',
    image: '/images/fancy-carton-photo.webp',
    alt: 'Premium printed fancy cartons produced by Essa Packages',
    options: ['Custom dimensions', 'Brand printing', 'Finish consultation']
  },
  {
    id: 'master-cartons',
    eyebrow: 'Storage & distribution',
    name: 'Master Cartons',
    benefit: 'Dependable outer packaging planned around handling, stacking, and transport.',
    bestFor: 'FMCG · Wholesale · Industrial',
    image: '/images/master-boxes-photo.webp',
    alt: 'Master cartons for bulk product transport',
    options: ['Custom sizing', 'Bulk production', 'Printed identification']
  },
  {
    id: 'corrugated-cartons',
    eyebrow: 'Protective structure',
    name: 'Corrugated Cartons',
    benefit: 'Protective cartons configured to suit the product and its delivery journey.',
    bestFor: 'E-commerce · Electronics · Fragile goods',
    image: '/images/origin-supply-photo.webp',
    alt: 'Corrugated packaging cartons for shipping and distribution',
    options: ['Board selection', 'Strength requirement', 'Custom structure']
  },
  {
    id: 'printed-cartons',
    eyebrow: 'Brand communication',
    name: 'Printed Cartons',
    benefit: 'Clear, confident print that carries your identity from production to the shelf.',
    bestFor: 'Retail · Pharmaceutical · FMCG',
    image: '/images/printed-cartons-photo.webp',
    alt: 'Brand printed cartons manufactured in Karachi',
    options: ['Colour requirements', 'Artwork support', 'Finish options']
  },
  {
    id: 'custom-boxes',
    eyebrow: 'Built around your product',
    name: 'Custom Boxes',
    benefit: 'A made-to-spec format for products that do not fit an off-the-shelf solution.',
    bestFor: 'New launches · Special formats · Retail',
    image: '/images/custom-rigid-gift-box-photo.webp',
    alt: 'Custom rigid product box with premium presentation',
    options: ['Structural planning', 'Product-fit sizing', 'Material consultation']
  },
  {
    id: 'retail-packaging',
    eyebrow: 'Unboxing & display',
    name: 'Retail Packaging',
    benefit: 'Presentation-led packaging designed to protect the product and strengthen its first impression.',
    bestFor: 'Lifestyle · Fashion · Consumer goods',
    image: '/images/bloom-studio-photo.webp',
    alt: 'Premium retail presentation packaging',
    options: ['Shelf presence', 'Branded print', 'Special finishes']
  }
];

const industries = [
  ['Food & Beverage', 'Food presentation, handling, and delivery needs.', '01'],
  ['FMCG', 'Repeatable packaging for busy product lines.', '02'],
  ['Cosmetics', 'Brand-led cartons with a refined shelf presence.', '03'],
  ['Pharmaceutical', 'Clear, precise printed product cartons.', '04'],
  ['E-commerce', 'Protective formats for dispatch and unboxing.', '05'],
  ['Retail', 'Packaging designed to sell as well as protect.', '06'],
  ['Electronics', 'Product-fit protection for sensitive items.', '07'],
  ['Industrial', 'Practical cartons for storage and movement.', '08'],
  ['Fragile Products', 'Protective structures planned around risk.', '09']
];

const qualityPoints = [
  [Layers3, 'Material selection', 'Material is considered against the product, presentation, and handling need.'],
  [Printer, 'Print accuracy', 'Artwork, colour requirements, and brand clarity are reviewed before production.'],
  [Ruler, 'Precision cutting', 'The structure is planned around the supplied size and product fit.'],
  [ShieldCheck, 'Structural strength', 'Strength requirements are discussed for storage, stacking, and delivery.'],
  [Sparkles, 'Finishing', 'Finishing choices are aligned with the desired appearance and use case.'],
  [PackageCheck, 'Final inspection', 'Completed packaging is checked for consistency before dispatch.']
];

const processSteps = [
  ['01', 'Tell us your requirements', 'Share the product, dimensions, quantity, and intended use.'],
  ['02', 'Packaging consultation', 'We review protection, presentation, and handling needs.'],
  ['03', 'Design & material selection', 'Agree the board, structure, print, and finish direction.'],
  ['04', 'Sample / approval', 'Review the sample or final specification before production.'],
  ['05', 'Printing & production', 'Approved cartons move through printing and manufacture.'],
  ['06', 'Quality inspection', 'Finished cartons are checked for consistency and fit.'],
  ['07', 'Packing & delivery', 'Orders are packed and dispatched to the agreed destination.']
];

const faqItems = [
  ['What is your minimum order quantity?', 'Minimum quantity depends on the carton type, size, material, and print requirement. Share your brief and we will confirm what is practical for your order.'],
  ['Can you manufacture custom-size cartons?', 'Yes. Cartons can be planned around your supplied length, width, height, product, and use case.'],
  ['Can you print our company branding?', 'Yes. Share your artwork and printing requirements so the team can review colour and finish options with you.'],
  ['What materials do you offer?', 'Material options vary by carton type and required strength. We will recommend suitable choices after understanding the product and journey.'],
  ['How long does production normally take?', 'Timing depends on specifications, quantity, approvals, and the current production schedule. Your expected timeline is confirmed during quotation.'],
  ['Do you handle bulk orders?', 'Yes. Essa Packages manufactures cartons for business and bulk packaging requirements.'],
  ['Can we provide our own design?', 'Yes. You can attach artwork or a reference with your inquiry for the team to review.'],
  ['Can you help us choose the correct box?', 'Yes. Tell us what you are packing, how it will be handled, and the presentation you want. We will help narrow down the right solution.'],
  ['Do you deliver outside Karachi?', 'Orders are accepted from businesses across Pakistan. Delivery arrangements are confirmed for each order.'],
  ['How can we request a quotation?', 'Use the quote builder, WhatsApp the team, call directly, or email your packaging brief.']
];

const initialQuote = {
  name: '', company: '', phone: '', whatsapp: '', email: '', product: '', packagingType: '',
  length: '', width: '', height: '', unit: 'in', quantity: '', material: '', printing: '',
  colors: '', finish: '', strength: '', city: '', requiredDate: '', notes: ''
};

function ButtonArrow() {
  return <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />;
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.42" />
    </svg>
  );
}

function Kicker({ children, dark = false }) {
  return <p className={`ep-kicker${dark ? ' ep-kicker-dark' : ''}`}>{children}</p>;
}

function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  return <Tag className={`reveal ${className}`} {...props}>{children}</Tag>;
}

function useReveals() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Header({ onQuote }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['Products', '#solutions'],
    ['Industries', '#industries'],
    ['Capabilities', '#quality'],
    ['About', '#about']
  ];

  return (
    <header className={`ep-header${scrolled ? ' is-scrolled' : ''}`}>
      <a className="ep-brand" href="#home" aria-label="Essa Packages home" onClick={() => setOpen(false)}>
        <img src="/images/essa-packages-logo.png" alt="Essa Packages" width="1780" height="884" />
      </a>
      <nav className={`ep-nav${open ? ' is-open' : ''}`} aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="ep-nav-contact" href="#contact" onClick={() => setOpen(false)}>Contact</a>
        <a className="ep-mobile-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /> WhatsApp {PHONE_DISPLAY}</a>
        <a className="ep-mobile-call" href={`tel:+${WHATSAPP_NUMBER}`}><Phone size={16} /> Call {PHONE_DISPLAY}</a>
        <button className="ep-mobile-quote" onClick={() => { setOpen(false); onQuote(); }}>Request a quote <ButtonArrow /></button>
      </nav>
      <div className="ep-header-actions">
        <a className="ep-header-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
          <WhatsAppIcon size={17} /> WhatsApp
        </a>
        <button className="ep-button ep-button-copper ep-header-quote" onClick={() => onQuote()}>
          Request a quote <ButtonArrow />
        </button>
      </div>
      <button className={`ep-menu${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
        <span /><span />
      </button>
    </header>
  );
}

function Hero({ onQuote }) {
  return (
    <section id="home" className="ep-hero">
      <div className="ep-hero-grid" aria-hidden="true" />
      <div className="ep-shell ep-hero-layout">
        <Reveal className="ep-hero-copy">
          <Kicker>Carton manufacturing · Karachi, Pakistan</Kicker>
          <h1>Built to protect.<br /><em>Printed to impress.</em></h1>
          <p>Custom cartons, corrugated boxes, and printed packaging manufactured in Karachi for businesses across Pakistan.</p>
          <div className="ep-hero-actions">
            <button className="ep-button ep-button-copper" onClick={() => onQuote()}>
              Request a quote <ArrowRight size={18} />
            </button>
            <a className="ep-button ep-button-ghost" href="#solutions">Explore packaging <ButtonArrow /></a>
          </div>
          <a className="ep-talk-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            <span><WhatsAppIcon size={16} /></span>
            <b>Talk to our packaging team</b>
            <small>WhatsApp · {PHONE_DISPLAY}</small>
          </a>
        </Reveal>

        <Reveal className="ep-hero-composition" aria-label="Essa Packages carton and retail packaging examples">
          <div className="ep-hero-halo" />
          <figure className="ep-pack-shot ep-pack-shot-main">
            <img src="/images/custom-rigid-gift-box-photo.webp" alt="Black custom rigid packaging box" width="1254" height="1254" fetchPriority="high" />
          </figure>
          <figure className="ep-pack-shot ep-pack-shot-left">
            <img src="/images/fancy-carton-photo.webp" alt="Printed fancy carton packaging" width="1167" height="1348" fetchPriority="low" decoding="async" />
          </figure>
          <figure className="ep-pack-shot ep-pack-shot-right">
            <img src="/images/origin-supply-photo.webp" alt="Corrugated mailer packaging" width="1254" height="1254" fetchPriority="low" decoding="async" />
          </figure>
          <div className="ep-hero-note ep-note-top"><span>Made to specification</span><b>Custom sizes & structures</b></div>
          <div className="ep-hero-note ep-note-bottom"><PackageCheck size={18} /><span><b>Business-ready packaging</b>Production-focused support</span></div>
        </Reveal>
      </div>
      <div className="ep-shell ep-trust-row" aria-label="Essa Packages capabilities">
        {['Custom manufacturing', 'Precision printing', 'Bulk order capability', 'Quality-controlled production', 'Karachi, Pakistan'].map((item, index) => (
          <span key={item}><i>0{index + 1}</i>{item}</span>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="about" className="ep-proof">
      <div className="ep-shell ep-proof-layout">
        <Reveal className="ep-proof-heading">
          <Kicker dark>Business proof, without the guesswork</Kicker>
          <h2>A manufacturing partner<br />you can <em>talk to.</em></h2>
        </Reveal>
        <Reveal className="ep-proof-copy">
          <p>Essa Packages works from a clear brief: what you are packing, how it needs to perform, how it should look, and when you need it.</p>
          <a href={`tel:+${WHATSAPP_NUMBER}`}>Speak directly with Imran Ahmed <ButtonArrow /></a>
        </Reveal>
        <div className="ep-proof-cards">
          {[
            [Factory, 'Karachi production', 'A real manufacturing address in North Karachi.'],
            [Ruler, 'Made to specification', 'Sizing and structure planned around your product.'],
            [Boxes, 'Bulk-order capability', 'Packaging support for ongoing business requirements.'],
            [ClipboardCheck, 'Quality-focused process', 'Checks built into planning, production, and dispatch.']
          ].map(([Icon, title, text]) => (
            <Reveal as="article" key={title}><Icon size={28} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="ep-industries ep-dark-section">
      <div className="ep-shell">
        <Reveal className="ep-section-heading ep-heading-split">
          <div><Kicker>Industries we serve</Kicker><h2>Packaging built around<br /><em>your industry.</em></h2></div>
          <p>Different products create different demands—from shelf presence to handling, protection, and dispatch. We start with the use case.</p>
        </Reveal>
        <div className="ep-industry-grid">
          {industries.map(([name, text, number]) => (
            <Reveal as="a" href="#solutions" key={name} className="ep-industry-card">
              <span>{number}</span><div><h3>{name}</h3><p>{text}</p></div><ArrowUpRight size={18} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solutions({ onDetails }) {
  return (
    <section id="solutions" className="ep-solutions">
      <div className="ep-shell">
        <Reveal className="ep-section-heading ep-heading-split">
          <div><Kicker dark>Packaging solutions</Kicker><h2>Custom cartons built for<br /><em>the job they have to do.</em></h2></div>
          <p>Start with a proven packaging direction, then tailor the size, material, printing, finish, and strength to your requirement.</p>
        </Reveal>
        <div className="ep-product-grid">
          {solutions.map((solution, index) => (
            <Reveal as="article" className="ep-product-card" key={solution.id}>
              <div className="ep-product-image">
                <img src={solution.image} alt={solution.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
                <span>{String(index + 1).padStart(2, '0')}</span>
                <button onClick={() => onDetails(solution)} aria-label={`View details for ${solution.name}`}><ArrowUpRight size={20} /></button>
              </div>
              <div className="ep-product-body">
                <small>{solution.eyebrow}</small><h3>{solution.name}</h3><p>{solution.benefit}</p>
                <ul className="ep-product-uses" aria-label={`Common uses for ${solution.name}`}>
                  {solution.bestFor.split(/\s*·\s*/).map(use => <li key={use}>{use}</li>)}
                </ul>
                <button className="ep-product-explore" onClick={() => onDetails(solution)}>Explore <ArrowRight size={16} /></button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteBuilderIntro({ onQuote }) {
  const specs = [
    ['Packaging type', 'Corrugated carton'],
    ['Dimensions', 'L × W × H'],
    ['Material', 'Choose with our team'],
    ['Printing', 'Plain or branded'],
    ['Quantity', 'Business / bulk order'],
    ['Delivery', 'City & required date']
  ];
  return (
    <section id="quote-builder" className="ep-configurator ep-dark-section">
      <div className="ep-shell ep-config-layout">
        <Reveal className="ep-config-copy">
          <Kicker>Custom packaging brief</Kicker>
          <h2>Tell us what you need.<br /><em>We’ll build it.</em></h2>
          <p>Build a clear manufacturing brief in a few minutes. Exact specifications are welcome, but they are not required to get the conversation started.</p>
          <button className="ep-button ep-button-copper" onClick={() => onQuote()}>Build my quote brief <ArrowRight size={18} /></button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Essa Packages, I need help choosing the right packaging specifications.')}`} target="_blank" rel="noreferrer">
            Not sure about specifications? <b>Ask on WhatsApp</b> <ButtonArrow />
          </a>
        </Reveal>
        <Reveal className="ep-spec-sheet">
          <div className="ep-spec-sheet-head"><div><Box size={22} /><span>Packaging brief</span></div><b>READY TO CONFIGURE</b></div>
          <div className="ep-spec-visual"><span>W</span><span>L</span><span>H</span><div className="ep-wire-box"><i /><i /><i /></div></div>
          <div className="ep-spec-list">
            {specs.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
          </div>
          <div className="ep-spec-footer"><Check size={15} /> Generates a clean inquiry summary</div>
        </Reveal>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="ep-process">
      <div className="ep-shell">
        <Reveal className="ep-section-heading ep-heading-split">
          <div><Kicker dark>How we work</Kicker><h2>From requirement to<br /><em>ready for dispatch.</em></h2></div>
          <p>A clear, collaborative path helps reduce uncertainty before production and keeps the job focused on the agreed brief.</p>
        </Reveal>
        <div className="ep-timeline">
          {processSteps.map(([number, label, text]) => (
            <Reveal as="article" key={number}><span>{number}</span><i /><div><h3>{label}</h3><p>{text}</p></div></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quality({ onQuote }) {
  return (
    <section id="quality" className="ep-quality ep-dark-section">
      <div className="ep-shell">
        <Reveal className="ep-quality-intro">
          <div><Kicker>Quality approach</Kicker><h2>Quality you can see.<br /><em>Strength you can trust.</em></h2></div>
          <div><p>Good packaging is the result of aligned choices. We review the material, print, dimensions, structure, and finish against the job the carton needs to perform.</p><button onClick={() => onQuote()}>Discuss your requirement <ButtonArrow /></button></div>
        </Reveal>
        <div className="ep-quality-grid">
          {qualityPoints.map(([Icon, title, text], index) => (
            <Reveal as="article" key={title}><span>0{index + 1}</span><Icon size={25} strokeWidth={1.4} /><h3>{title}</h3><p>{text}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactLocation() {
  const initialInquiry = { name: '', company: '', phone: '', email: '', type: '', quantity: '', message: '', website: '' };
  const [data, setData] = useState(initialInquiry);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const update = event => setData(current => ({ ...current, [event.target.name]: event.target.value }));
  const whatsappMessage = [
    'Hello Essa Packages, I have a packaging inquiry.',
    `Name: ${data.name || 'Not supplied'}`,
    `Company: ${data.company || 'Not supplied'}`,
    `Packaging: ${data.type || 'Not selected'}`,
    `Estimated quantity: ${data.quantity || 'Not supplied'}`,
    `Requirements: ${data.message || 'I would like to discuss my requirements.'}`
  ].join('\n');

  const submit = async event => {
    event.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          formType: 'inquiry',
          name: data.name,
          company: data.company,
          phone: data.phone,
          email: data.email,
          type: data.type,
          quantity: data.quantity,
          dimensions: '',
          details: `Quick website inquiry\nMessage: ${data.message || 'No additional message supplied.'}`,
          website: data.website
        })
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.error || 'The inquiry could not be sent.');
      setResult({ type: 'success', message: `Thank you. Your inquiry has been received${responseData.quoteId ? ` — reference ${responseData.quoteId}` : ''}.` });
      setData(initialInquiry);
    } catch {
      setResult({ type: 'error', message: 'We could not send the form right now. Please use the WhatsApp option below and our team will help you.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="ep-contact-location">
      <div className="ep-shell ep-contact-location-grid">
        <Reveal className="ep-inquiry-panel">
          <Kicker dark>Contact Essa Packages</Kicker>
          <h2>Have a packaging<br />requirement?<br /><span>Let’s talk.</span></h2>
          <p>Tell us what you’re packaging, your required quantity, and any size or printing requirements. Our team can help you find the right carton solution.</p>
          <form className="ep-inquiry-form" onSubmit={submit}>
            <label>Name *<input required name="name" value={data.name} onChange={update} autoComplete="name" placeholder="Your name" /></label>
            <label>Company name<input name="company" value={data.company} onChange={update} autoComplete="organization" placeholder="Business or brand" /></label>
            <label>Phone / WhatsApp *<input required type="tel" name="phone" value={data.phone} onChange={update} autoComplete="tel" placeholder="03XX XXXXXXX" /></label>
            <label>Email<input type="email" name="email" value={data.email} onChange={update} autoComplete="email" placeholder="you@company.com" /></label>
            <label>What do you need? *
              <select required name="type" value={data.type} onChange={update}>
                <option value="">Select packaging</option>
                {['Fancy Cartons', 'Master Cartons', 'Corrugated Cartons', 'Printed Cartons', 'Custom Boxes', 'Retail Packaging', 'Other'].map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>Estimated quantity<input name="quantity" value={data.quantity} onChange={update} inputMode="numeric" placeholder="e.g. 5,000 units" /></label>
            <label className="ep-inquiry-message">Message / Requirements<textarea name="message" value={data.message} onChange={update} placeholder="Product, dimensions, printing, timeline, or anything else that will help us understand the requirement." /></label>
            <label className="ep-inquiry-honeypot" aria-hidden="true">Website<input name="website" value={data.website} onChange={update} tabIndex="-1" autoComplete="off" /></label>
            {result && <p className={`ep-inquiry-status ${result.type}`} role={result.type === 'error' ? 'alert' : 'status'}>{result.message}</p>}
            <button className="ep-button ep-button-copper ep-inquiry-submit" type="submit" disabled={sending}>{sending ? 'Sending inquiry…' : 'Send inquiry'} <ArrowRight size={18} /></button>
          </form>
          <div className="ep-inquiry-whatsapp"><span>Prefer WhatsApp?</span><a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={20} /> Chat with our team <ButtonArrow /></a></div>
        </Reveal>

        <Reveal className="ep-location-panel">
          <div className="ep-location-map">
            <iframe title="Essa Packages location in North Karachi" src={MAP_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
          <div className="ep-location-details">
            <Kicker>Location & direct contact</Kicker>
            <h3>Visit Essa Packages</h3>
            <address><b>Essa Packages</b><span>Plot No. B-81, Sector 11-E<br />New Fatima Jinnah Colony, Near Godra<br />North Karachi</span><strong>Karachi, Pakistan</strong></address>
            <dl>
              <div><dt>Phone</dt><dd><a href={`tel:+${WHATSAPP_NUMBER}`}>{PHONE_DISPLAY}</a></dd></div>
              <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">{PHONE_DISPLAY}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
            </dl>
            <div className="ep-location-actions">
              <a className="ep-button ep-button-copper" href={MAP_DIRECTIONS_URL} target="_blank" rel="noreferrer"><MapPin size={17} /> Get directions</a>
              <a className="ep-button ep-button-ghost" href={`tel:+${WHATSAPP_NUMBER}`}><Phone size={17} /> Call us</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FactoryStory() {
  return (
    <section className="ep-factory ep-dark-section">
      <div className="ep-shell ep-factory-grid">
        <Reveal className="ep-factory-media">
          <img src="/images/packaging-hero.webp" alt="Essa Packages carton manufacturing product range" loading="lazy" />
          <div><Factory size={22} /><span>North Karachi</span><b>Manufacturing address</b></div>
        </Reveal>
        <Reveal className="ep-factory-copy">
          <Kicker>Made in Karachi</Kicker>
          <h2>Built for<br /><em>businesses.</em></h2>
          <p>From the initial requirement to finished cartons, every stage is centered on the packaging your product actually needs.</p>
          <ol>
            {['Custom production', 'Bulk orders', 'Brand printing', 'Business packaging'].map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}
          </ol>
          <div className="ep-factory-address"><MapPin size={18} /><span>{LOCATION_ADDRESS}</span></div>
          <a className="ep-button ep-button-copper" href="#quality">Discover our capabilities <ArrowRight size={17} /></a>
        </Reveal>
      </div>
    </section>
  );
}

function WhyEssa({ onQuote }) {
  const reasons = [
    ['Product-first thinking', 'Packaging designed around what it protects.'],
    ['Brand-conscious design', 'Packaging that strengthens product presentation.'],
    ['Built for business', 'Solutions for repeat and bulk requirements.'],
    ['Reliable support', 'Clear communication from inquiry to production.']
  ];
  return (
    <section className="ep-why">
      <div className="ep-shell ep-why-layout">
        <Reveal className="ep-why-title"><Kicker dark>Why Essa Packages</Kicker><h2>More than a box<br /><em>manufacturer.</em></h2><p>A practical packaging partner for businesses that care about product protection, brand presentation, and reliable communication.</p></Reveal>
        <div className="ep-why-list">
          {reasons.map(([title, text], index) => <Reveal as="article" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>)}
        </div>
        <Reveal className="ep-sample-card">
          <div><PackageCheck size={26} /><Kicker>Sample discussion</Kicker><h3>Want to check the quality first?</h3><p>Ask about available packaging samples or discuss whether a sample is suitable for your project.</p></div>
          <button onClick={() => onQuote({ packagingType: 'Sample discussion', notes: 'I would like to discuss available packaging samples for my project.' })}>Request a sample discussion <ButtonArrow /></button>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="ep-faq">
      <div className="ep-shell ep-faq-layout">
        <Reveal className="ep-faq-intro"><Kicker dark>Buyer questions</Kicker><h2>Before you place<br /><em>an order.</em></h2><p>Short answers to the questions businesses ask most often.</p><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">Still unsure? Ask on WhatsApp <ButtonArrow /></a></Reveal>
        <div className="ep-accordion">
          {faqItems.map(([question, answer], index) => (
            <article className={open === index ? 'is-open' : ''} key={question}>
              <button onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><ChevronDown size={20} /></button>
              <div><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA({ onQuote }) {
  return (
    <section id="start" className="ep-contact-cta ep-dark-section">
      <div className="ep-contact-pattern" aria-hidden="true" />
      <div className="ep-shell ep-contact-layout">
        <Reveal className="ep-contact-copy"><Kicker>Ready when you are</Kicker><h2>Let’s build your<br /><em>next package.</em></h2><p>Tell us what you’re packaging and we’ll help you find the right solution.</p><div className="ep-contact-buttons"><button className="ep-button ep-button-copper" onClick={() => onQuote()}>Request a quote <ArrowRight size={18} /></button><a className="ep-button ep-button-ghost" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> WhatsApp us</a></div></Reveal>
      </div>
    </section>
  );
}

function Footer({ onQuote }) {
  return (
    <footer className="ep-footer">
      <div className="ep-shell ep-footer-main">
        <div className="ep-footer-brand"><a href="#home"><img src="/images/essa-packages-logo.png" alt="Essa Packages" width="1780" height="884" loading="lazy" /></a><p>Custom cartons, printed packaging, and corrugated solutions for businesses across Pakistan.</p></div>
        <div><span>Products</span><a href="#solutions">Custom cartons</a><a href="#solutions">Corrugated boxes</a><a href="#solutions">Printed packaging</a><a href="#solutions">Master cartons</a></div>
        <div><span>Company</span><a href="#about">About</a><a href="#quality">Capabilities</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></div>
        <address><span>Contact</span><p>Plot No. B-81, Sector 11-E<br />New Fatima Jinnah Colony<br />Near Godra, North Karachi</p><a href={`tel:+${WHATSAPP_NUMBER}`}>{PHONE_DISPLAY}</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp {PHONE_DISPLAY}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></address>
      </div>
      <div className="ep-shell ep-footer-bottom"><span>© {new Date().getFullYear()} Essa Packages</span><span>Carton manufacturer · Karachi, Pakistan</span><div><span>Privacy</span><span>Terms</span><a href="#home">Back to top ↑</a></div></div>
    </footer>
  );
}

function ProductDetails({ solution, onClose, onQuote }) {
  useEffect(() => {
    const handler = event => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  if (!solution) return null;
  return (
    <div className="ep-dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="ep-product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <button className="ep-dialog-close" onClick={onClose} aria-label="Close product details"><X size={20} /></button>
        <img src={solution.image} alt={solution.alt} />
        <div><Kicker dark>{solution.eyebrow}</Kicker><h2 id="product-dialog-title">{solution.name}</h2><p>{solution.benefit}</p><span className="ep-dialog-label">Available project options</span><ul>{solution.options.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><div className="ep-dialog-best"><small>Best suited to</small><b>{solution.bestFor}</b></div><button className="ep-button ep-button-copper" onClick={() => { onClose(); onQuote({ packagingType: solution.name }); }}>Get a quote for this <ArrowRight size={17} /></button></div>
      </section>
    </div>
  );
}

function QuoteDialog({ seed, onClose }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...initialQuote, ...seed });
  const [artwork, setArtwork] = useState(null);
  const [reference, setReference] = useState(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const handler = event => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const update = event => setData(current => ({ ...current, [event.target.name]: event.target.value }));
  const dimensions = [data.length, data.width, data.height].some(Boolean) ? `${data.length || '—'} × ${data.width || '—'} × ${data.height || '—'} ${data.unit}` : 'Not supplied';
  const summary = useMemo(() => [
    `ESSA PACKAGES — PACKAGING INQUIRY`,
    `Company: ${data.company || 'Not supplied'}`,
    `Contact: ${data.name || 'Not supplied'} · ${data.phone || data.whatsapp || data.email || 'Not supplied'}`,
    `Product: ${data.product || 'Not supplied'}`,
    `Packaging: ${data.packagingType || 'Not supplied'}`,
    `Dimensions: ${dimensions}`,
    `Quantity: ${data.quantity || 'Not supplied'}`,
    `Material: ${data.material || 'To be discussed'}`,
    `Printing: ${data.printing || 'To be discussed'}${data.colors ? ` · ${data.colors} colour(s)` : ''}`,
    `Finish: ${data.finish || 'To be discussed'}`,
    `Strength: ${data.strength || 'To be discussed'}`,
    `Delivery: ${data.city || 'Not supplied'}${data.requiredDate ? ` · required ${data.requiredDate}` : ''}`,
    `Notes: ${data.notes || 'None'}`,
    `Files: ${[artwork?.name, reference?.name].filter(Boolean).join(' · ') || 'None selected'}`
  ].join('\n'), [data, dimensions, artwork, reference]);

  const validateFile = (file, setter) => {
    if (!file) return setter(null);
    if (file.size > 4 * 1024 * 1024) {
      setResult({ type: 'error', message: 'Each attachment must be smaller than 4 MB.' });
      return setter(null);
    }
    setResult(null);
    setter(file);
  };

  const submit = async event => {
    event.preventDefault();
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    setSending(true);
    setResult(null);
    const details = summary.split('\n').slice(4).join('\n');
    try {
      const payload = {
        action: 'submit',
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.whatsapp || data.phone,
        type: data.packagingType,
        quantity: data.quantity,
        dimensions,
        details
      };
      const selectedFile = artwork || reference;
      if (selectedFile) {
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        payload.file = { name: selectedFile.name, type: selectedFile.type, data: fileData };
      }
      const response = await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.error || 'The online request could not be saved.');
      setResult({ type: 'success', message: 'Your request has been received.', id: responseData.quoteId });
    } catch (error) {
      setResult({ type: 'fallback', message: `${error.message} Your full brief is ready to send by WhatsApp.` });
    } finally {
      setSending(false);
    }
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(`Packaging quote request — ${data.company || data.name || 'New inquiry'}`)}&body=${encodeURIComponent(summary)}`;

  if (result?.type === 'success' || result?.type === 'fallback') {
    return (
      <div className="ep-dialog-backdrop ep-quote-backdrop">
        <section className="ep-quote-result" role="dialog" aria-modal="true" aria-labelledby="quote-result-title">
          <button className="ep-dialog-close" onClick={onClose} aria-label="Close quote summary"><X size={20} /></button>
          <div className={`ep-result-icon ${result.type}`}><Check size={24} /></div>
          <Kicker dark>Inquiry summary</Kicker>
          <h2 id="quote-result-title">Your brief is<br /><em>ready to review.</em></h2>
          <p>{result.message}{result.id ? ` Reference: ${result.id}.` : ''}</p>
          <pre>{summary}</pre>
          {reference && artwork && <small className="ep-attachment-note">The artwork file was included with the online request. Please attach “{reference.name}” when continuing on WhatsApp or email.</small>}
          <div className="ep-result-actions"><a className="ep-button ep-button-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> Send on WhatsApp</a><a className="ep-button ep-button-outline-dark" href={mailHref}><Mail size={18} /> Email summary</a></div>
        </section>
      </div>
    );
  }

  return (
    <div className="ep-dialog-backdrop ep-quote-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="ep-quote-dialog" role="dialog" aria-modal="true" aria-labelledby="quote-dialog-title">
        <button className="ep-dialog-close" onClick={onClose} aria-label="Close quote builder"><X size={20} /></button>
        <aside>
          <Kicker>Packaging quote builder</Kicker>
          <h2 id="quote-dialog-title">A better quote starts with a <em>clear brief.</em></h2>
          <p>Complete what you know. Leave the rest for a packaging discussion.</p>
          <div className="ep-quote-progress">
            {[['01', 'Packaging'], ['02', 'Dimensions'], ['03', 'Quantity'], ['04', 'Printing'], ['05', 'Contact']].map(([number, label], index) => <div className={step >= index + 1 ? 'is-active' : ''} key={number}><span>{step > index + 1 ? <Check size={14} /> : number}</span><b>{label}</b></div>)}
          </div>
          <div className="ep-live-summary"><small>Live brief</small><b>{data.packagingType || 'Packaging type'}</b><span>{data.quantity ? `${data.quantity} units` : 'Quantity not added'}</span><span>{dimensions}</span></div>
        </aside>
        <form onSubmit={submit}>
          <div className="ep-form-head"><span>Step {step} of 5</span><b>{['Choose your packaging', 'Enter dimensions', 'Set quantity and strength', 'Printing and finishing', 'Contact details'][step - 1]}</b></div>
          {step === 1 && <div className="ep-form-grid">
            <label className="ep-span-2">Product being packed<input autoFocus required name="product" value={data.product} onChange={update} placeholder="e.g. skincare bottle, frozen food, electronics" /></label>
            <label className="ep-span-2">Packaging type<select required name="packagingType" value={data.packagingType} onChange={update}><option value="">Select a direction</option>{solutions.map(item => <option key={item.name}>{item.name}</option>)}<option>Shipping Cartons</option><option>Heavy-Duty Packaging</option><option>Other / Not sure</option><option>Sample discussion</option></select></label>
          </div>}
          {step === 2 && <div className="ep-form-grid">
            <fieldset className="ep-dimensions ep-span-2"><legend>Required dimensions <small>(optional)</small></legend><div><label>Length<input inputMode="decimal" name="length" value={data.length} onChange={update} placeholder="L" /></label><label>Width<input inputMode="decimal" name="width" value={data.width} onChange={update} placeholder="W" /></label><label>Height<input inputMode="decimal" name="height" value={data.height} onChange={update} placeholder="H" /></label><label>Unit<select name="unit" value={data.unit} onChange={update}><option value="in">inches</option><option value="cm">cm</option><option value="mm">mm</option></select></label></div></fieldset>
            <div className="ep-form-help ep-span-2"><Ruler size={19} /><span><b>Dimensions are optional</b><small>If you are unsure, continue and our packaging team will help you determine the right size.</small></span></div>
          </div>}
          {step === 3 && <div className="ep-form-grid">
            <label className="ep-span-2">Required quantity<input autoFocus required min="1" type="number" name="quantity" value={data.quantity} onChange={update} placeholder="e.g. 1000" /></label>
            <label className="ep-span-2">Strength requirement<select name="strength" value={data.strength} onChange={update}><option value="">Standard / advise me</option><option>Retail display</option><option>Storage & stacking</option><option>Shipping / courier</option><option>Heavy-duty handling</option><option>Fragile product protection</option></select></label>
          </div>}
          {step === 4 && <div className="ep-form-grid">
            <label>Material<select autoFocus name="material" value={data.material} onChange={update}><option value="">Not sure — advise me</option><option>Corrugated board</option><option>Paperboard / card</option><option>Kraft board</option><option>Rigid board</option><option>Other</option></select></label>
            <label>Printing requirement<select name="printing" value={data.printing} onChange={update}><option value="">Not sure — advise me</option><option>Plain / unprinted</option><option>Brand printing</option><option>Full-colour printing</option><option>Single-colour printing</option></select></label>
            <label>Number of colours<select name="colors" value={data.colors} onChange={update}><option value="">Not specified</option><option>1</option><option>2</option><option>3</option><option>4 / full colour</option></select></label>
            <label>Finish<select name="finish" value={data.finish} onChange={update}><option value="">Not sure — advise me</option><option>Matte</option><option>Gloss</option><option>Lamination</option><option>Foil detail</option><option>Other</option></select></label>
          </div>}
          {step === 5 && <div className="ep-form-grid">
            <label>Full name<input autoFocus required name="name" value={data.name} onChange={update} placeholder="Your name" /></label>
            <label>Company name<input required name="company" value={data.company} onChange={update} placeholder="Your business" /></label>
            <label>Phone<input name="phone" value={data.phone} onChange={update} placeholder="03XX XXXXXXX" /></label>
            <label>WhatsApp<input name="whatsapp" value={data.whatsapp} onChange={update} placeholder="If different from phone" /></label>
            <label className="ep-span-2">Email<input required type="email" name="email" value={data.email} onChange={update} placeholder="you@company.com" /></label>
            <label>Delivery city<input name="city" value={data.city} onChange={update} placeholder="e.g. Karachi, Lahore" /></label>
            <label>Required date <small>(subject to confirmation)</small><div className="ep-input-icon"><CalendarDays size={17} /><input type="date" name="requiredDate" value={data.requiredDate} onChange={update} /></div></label>
            <label className="ep-span-2">Anything else?<textarea name="notes" value={data.notes} onChange={update} placeholder="Product weight, handling conditions, printing notes, timeline, or other context…" /></label>
            <label className="ep-upload"><Upload size={18} /><span><b>Upload artwork</b><small>{artwork?.name || 'PDF, AI, PSD, PNG or JPG · max 4 MB'}</small></span><input type="file" accept=".pdf,.ai,.psd,.png,.jpg,.jpeg" onChange={event => validateFile(event.target.files?.[0], setArtwork)} /></label>
            <label className="ep-upload"><Upload size={18} /><span><b>Upload reference packaging</b><small>{reference?.name || 'PDF, PNG or JPG · max 4 MB'}</small></span><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={event => validateFile(event.target.files?.[0], setReference)} /></label>
          </div>}
          {result?.type === 'error' && <p className="ep-form-error" role="alert">{result.message}</p>}
          <div className="ep-form-actions">{step > 1 ? <button type="button" onClick={() => setStep(step - 1)}>← Back</button> : <span />}<button className="ep-button ep-button-copper" type="submit" disabled={sending}>{step < 5 ? 'Continue' : sending ? 'Preparing request…' : 'Get my packaging quote'} <ArrowRight size={17} /></button></div>
          <a className="ep-form-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Essa Packages, I am not sure which packaging specifications I need.')}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={17} /> Not sure what you need? <b>Ask us on WhatsApp</b></a>
        </form>
      </section>
    </div>
  );
}

function MobileActions({ onQuote }) {
  return <div className="ep-mobile-actions"><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> WhatsApp</a><button onClick={() => onQuote()}><ClipboardCheck size={18} /> Get quote</button></div>;
}

function FloatingWhatsApp() {
  return (
    <a className="ep-floating-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Chat with Essa Packages on WhatsApp">
      <WhatsAppIcon size={29} />
      <span>Chat with Essa Packages</span>
    </a>
  );
}

export function ManufacturingSite() {
  const [quote, setQuote] = useState(null);
  const [product, setProduct] = useState(null);
  useReveals();

  useEffect(() => {
    document.body.classList.toggle('ep-modal-open', Boolean(quote || product));
    return () => document.body.classList.remove('ep-modal-open');
  }, [quote, product]);

  const openQuote = (seed = {}) => setQuote({ key: Date.now(), seed });

  return (
    <>
      <Header onQuote={openQuote} />
      <main>
        <Hero onQuote={openQuote} />
        <TrustSection />
        <Industries />
        <Solutions onDetails={setProduct} />
        <QuoteBuilderIntro onQuote={openQuote} />
        <Process />
        <Quality onQuote={openQuote} />
        <ContactLocation />
        <FactoryStory />
        <WhyEssa onQuote={openQuote} />
        <FAQ />
        <ContactCTA onQuote={openQuote} />
      </main>
      <Footer onQuote={openQuote} />
      <FloatingWhatsApp />
      <MobileActions onQuote={openQuote} />
      {product && <ProductDetails solution={product} onClose={() => setProduct(null)} onQuote={openQuote} />}
      {quote && <QuoteDialog key={quote.key} seed={quote.seed} onClose={() => setQuote(null)} />}
    </>
  );
}
