// Curated architectural dispatches & schematics from index.html
export const CURATED_DISPATCHES = [
      {
        id: "netflix-active-active",
        company: "Netflix",
        blog: "Netflix TechBlog",
        title: "Multi-Region Active-Active at 100M Requests/Second",
        summary: "Automated traffic evacuation and sub-second failovers across multi-region AWS cloud footprints during trans-continental transit outages, eliminating single points of failure in global streaming delivery.",
        takeaways: [
          "DNS evacuation via Zuul edge proxy routing with zero connection dropoff.",
          "Asynchronous cross-region Cassandra replication with monotonic conflict resolution.",
          "Chaos automation regularly inducing whole-region terminations to validate self-healing thresholds."
        ],
        tag: "Distributed Systems",
        tape: "tape-scotch-corner",
        coords: { top: "11%", left: "4%", rotate: -6 },
        annotation: "Sub-second cross-region failover",
        readingTime: "9 min",
        level: "Staff / Infrastructure",
        url: "https://netflixtechblog.com/active-active-for-multi-regional-resiliency-c47719f6685b",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="net-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#E50914" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#E50914" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="net-arc-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#E50914"/>
                <stop offset="50%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#10B981"/>
              </linearGradient>
              <linearGradient id="net-arc-failover" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#EF4444"/>
                <stop offset="100%" stop-color="#F59E0B"/>
              </linearGradient>
              <filter id="glow-net" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#0A0E17"/>

            <!-- Top Title Bar & Telemetry Wave -->
            <path d="M 15 28 L 65 28 L 75 18 L 85 36 L 95 14 L 105 34 L 115 28 L 210 28 L 220 22 L 230 32 L 240 28 L 305 28" fill="none" stroke="rgba(229,9,20,0.6)" stroke-width="1.2"/>
            <circle cx="95" cy="14" r="2.5" fill="#E50914" filter="url(#glow-net)"/>
            <text x="15" y="18" fill="rgba(255,255,255,0.75)" font-family="monospace" font-size="6.5" font-weight="bold">ACTIVE-ACTIVE TRAFFIC MESH</text>
            <text x="305" y="18" fill="#10B981" font-family="monospace" font-size="6.5" text-anchor="end">&bull; 100.4M RPS TOTAL</text>

            <!-- Wireframe Globe -->
            <circle cx="160" cy="116" r="72" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <ellipse cx="160" cy="116" rx="72" ry="28" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
            <ellipse cx="160" cy="116" rx="72" ry="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8"/>
            <ellipse cx="160" cy="116" rx="34" ry="72" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
            <circle cx="160" cy="116" r="72" fill="url(#net-glow)"/>

            <!-- Continental Nodes -->
            <!-- US-East (x: 95, y: 94) -->
            <circle cx="95" cy="94" r="14" fill="rgba(229,9,20,0.15)"/>
            <circle cx="95" cy="94" r="5" fill="#E50914" filter="url(#glow-net)"/>
            <circle cx="95" cy="94" r="2" fill="#FFFFFF"/>
            <text x="95" y="82" fill="#E50914" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">US-EAST</text>
            <text x="95" y="112" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="5.5" text-anchor="middle">52M rps</text>

            <!-- EU-West (x: 180, y: 80) -->
            <circle cx="180" cy="80" r="14" fill="rgba(16,185,129,0.15)"/>
            <circle cx="180" cy="80" r="5" fill="#10B981" filter="url(#glow-net)"/>
            <circle cx="180" cy="80" r="2" fill="#FFFFFF"/>
            <text x="180" y="68" fill="#10B981" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">EU-WEST</text>
            <text x="180" y="98" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="5.5" text-anchor="middle">38M rps</text>

            <!-- AP-South (x: 228, y: 120) -->
            <circle cx="228" cy="120" r="12" fill="rgba(245,158,11,0.15)"/>
            <circle cx="228" cy="120" r="4.5" fill="#F59E0B" filter="url(#glow-net)"/>
            <circle cx="228" cy="120" r="1.8" fill="#FFFFFF"/>
            <text x="228" y="110" fill="#F59E0B" font-family="monospace" font-size="6.5" font-weight="bold" text-anchor="middle">AP-SOUTH</text>

            <!-- Arcing Routing Paths -->
            <path d="M 95 94 Q 135 42 180 80" fill="none" stroke="url(#net-arc-1)" stroke-width="2" stroke-linecap="round"/>
            <path d="M 180 80 Q 205 87 228 120" fill="none" stroke="url(#net-arc-1)" stroke-width="1.8" stroke-dasharray="3,2"/>
            
            <!-- Evacuation Re-route Arc -->
            <path d="M 95 94 Q 150 162 228 120" fill="none" stroke="url(#net-arc-failover)" stroke-width="1.5" stroke-dasharray="4,3"/>
            <rect x="135" y="146" width="60" height="14" rx="3" fill="#0A0E17" stroke="rgba(239,68,68,0.5)" stroke-width="0.8"/>
            <text x="165" y="156" fill="#EF4444" font-family="monospace" font-size="5.5" font-weight="bold" text-anchor="middle">FAILOVER &Delta; 180ms</text>
          </svg>
        `
      },
      {
        id: "stripe-idempotency",
        company: "Stripe",
        blog: "Stripe Engineering",
        title: "Designing Idempotent APIs: Exactly-Once Processing",
        summary: "A deep architectural breakdown of Stripe's replay deduplication engine, atomic distributed locks in Redis, and guaranteeing mathematical financial consistency across concurrent retry bursts.",
        takeaways: [
          "Unique Idempotency-Key headers mapped into 24-hour transient state stores.",
          "Atomic locks prevent parallel processing of the same authorization token.",
          "Cached response replay with cryptographically signed payloads prevents replay tampering."
        ],
        tag: "API Design",
        tape: "tape-scotch-center",
        coords: { top: "9%", right: "4%", rotate: 5 },
        annotation: "Classic system design benchmark",
        readingTime: "12 min",
        level: "Senior / Fintech",
        url: "https://stripe.com/blog/idempotency",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="str-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0284C7"/>
                <stop offset="100%" stop-color="#38BDF8"/>
              </linearGradient>
              <filter id="glow-str" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#090E18"/>

            <!-- Top Title Bar -->
            <text x="18" y="24" fill="rgba(255,255,255,0.75)" font-family="monospace" font-size="6.5" font-weight="bold">IDEMPOTENCY DEDUPLICATION ENGINE</text>
            <text x="302" y="24" fill="#F59E0B" font-family="monospace" font-size="6.5" text-anchor="end">EXACTLY-ONCE GUARANTEE</text>

            <!-- Blueprint grid lines -->
            <line x1="20" y1="44" x2="300" y2="44" stroke="rgba(2,132,199,0.12)" stroke-width="0.8"/>
            <line x1="20" y1="102" x2="300" y2="102" stroke="rgba(2,132,199,0.12)" stroke-width="0.8"/>
            <line x1="20" y1="162" x2="300" y2="162" stroke="rgba(2,132,199,0.12)" stroke-width="0.8"/>

            <!-- Step 1: Incoming Capsule -->
            <g transform="translate(18, 76)">
              <rect width="70" height="48" rx="6" fill="rgba(2,132,199,0.12)" stroke="#0284C7" stroke-width="1.2"/>
              <text x="35" y="16" fill="#38BDF8" font-family="monospace" font-size="6.5" font-weight="bold" text-anchor="middle">API REQUEST</text>
              <rect x="6" y="22" width="58" height="18" rx="3" fill="#090E18" stroke="rgba(245,158,11,0.5)" stroke-width="0.8"/>
              <text x="35" y="31" fill="#FBBF24" font-family="monospace" font-size="5" text-anchor="middle">Idempotency-Key</text>
              <text x="35" y="37" fill="rgba(255,255,255,0.4)" font-family="monospace" font-size="4.5" text-anchor="middle">"req_9a4f2e..."</text>
            </g>

            <!-- Flow arrow to Lock Gate -->
            <path d="M 88 100 L 115 100" stroke="url(#str-cyan)" stroke-width="2" stroke-linecap="round"/>
            <polygon points="118,100 112,96 112,104" fill="#38BDF8"/>

            <!-- Step 2: The Mechanical Lock Gate (Center Vault) -->
            <g transform="translate(120, 52)">
              <rect width="84" height="96" rx="8" fill="#0D1626" stroke="#F59E0B" stroke-width="1.4" filter="url(#glow-str)"/>
              <circle cx="42" cy="30" r="16" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" stroke-width="1.2"/>
              <circle cx="42" cy="30" r="7" fill="none" stroke="#FBBF24" stroke-width="1.5"/>
              <rect x="40" y="28" width="4" height="10" fill="#FBBF24"/>
              
              <text x="42" y="58" fill="#F59E0B" font-family="monospace" font-size="6.5" font-weight="bold" text-anchor="middle">ATOMIC LOCK</text>
              <rect x="10" y="64" width="64" height="14" rx="3" fill="rgba(16,185,129,0.15)" stroke="#10B981" stroke-width="0.8"/>
              <text x="42" y="74" fill="#34D399" font-family="monospace" font-size="5.5" font-weight="bold" text-anchor="middle">SETNX SUCCESS</text>
              <text x="42" y="86" fill="rgba(255,255,255,0.4)" font-family="monospace" font-size="4.5" text-anchor="middle">TTL: 86,400s</text>
            </g>

            <!-- Split Branch: Path A (Execution) vs Path B (Replay) -->
            <!-- Path A: New Execution (Top branch) -->
            <path d="M 204 80 L 230 60 L 244 60" stroke="#10B981" stroke-width="1.5" stroke-linecap="round"/>
            <polygon points="247,60 241,57 241,63" fill="#10B981"/>
            <g transform="translate(248, 42)">
              <rect width="60" height="36" rx="5" fill="rgba(16,185,129,0.1)" stroke="#10B981" stroke-width="1"/>
              <text x="30" y="15" fill="#34D399" font-family="monospace" font-size="5.5" font-weight="bold" text-anchor="middle">LEDGER COMMIT</text>
              <text x="30" y="26" fill="rgba(255,255,255,0.6)" font-family="monospace" font-size="5" text-anchor="middle">$420.00 CHARGED</text>
            </g>

            <!-- Path B: Duplicate Cached Replay (Bottom branch) -->
            <path d="M 204 120 L 230 140 L 244 140" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3,2" stroke-linecap="round"/>
            <polygon points="247,140 241,137 241,143" fill="#38BDF8"/>
            <g transform="translate(248, 122)">
              <rect width="60" height="36" rx="5" fill="rgba(2,132,199,0.1)" stroke="#38BDF8" stroke-width="1"/>
              <text x="30" y="15" fill="#38BDF8" font-family="monospace" font-size="5.5" font-weight="bold" text-anchor="middle">CACHED REPLAY</text>
              <text x="30" y="26" fill="#FBBF24" font-family="monospace" font-size="4.8" text-anchor="middle">0 NEW CHARGES</text>
            </g>
          </svg>
        `
      },
      {
        id: "cloudflare-ebpf-ddos",
        company: "Cloudflare",
        blog: "Cloudflare Blog",
        title: "Mitigating 3.8 Tbps DDoS Attacks in Kernel Space",
        summary: "Execution of wire-speed eBPF packet filters at the physical NIC driver layer (XDP), dropping malicious packets before memory allocation occurs inside the operating system network stack.",
        takeaways: [
          "XDP_DROP executed directly inside device driver rings before sk_buff allocation.",
          "Kernel maps synchronized with globally distributed heuristic detection engines in real time.",
          "Zero CPU interrupt overload during multi-terabit volumetric UDP amplification floods."
        ],
        tag: "Kernel / eBPF",
        tape: "tape-washi-top",
        coords: { bottom: "11%", right: "6%", rotate: 7 },
        annotation: "Dropped at wire speed in NIC",
        readingTime: "7 min",
        level: "Principal / Networking",
        url: "https://blog.cloudflare.com/how-cloudflare-auto-mitigated-world-record-3-8-tbps-ddos-attack/",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cf-fire" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#DC2626"/>
                <stop offset="60%" stop-color="#EA580C"/>
                <stop offset="100%" stop-color="#F59E0B"/>
              </linearGradient>
              <linearGradient id="cf-shield-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#06B6D4"/>
                <stop offset="50%" stop-color="#3B82F6"/>
                <stop offset="100%" stop-color="#10B981"/>
              </linearGradient>
              <filter id="glow-cf" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#080B13"/>

            <!-- Top Title -->
            <text x="18" y="22" fill="rgba(255,255,255,0.8)" font-family="monospace" font-size="6.5" font-weight="bold">eBPF HARDWARE-LEVEL PACKET FILTER</text>
            <text x="302" y="22" fill="#06B6D4" font-family="monospace" font-size="6.5" text-anchor="end">KERNEL WIRE SPEED</text>

            <!-- Background bus lanes -->
            <line x1="10" y1="65" x2="310" y2="65" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="10" y1="105" x2="310" y2="105" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <line x1="10" y1="145" x2="310" y2="145" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

            <!-- Inbound DDoS Packet Storm (Left) -->
            <path d="M 10 55 L 140 85" stroke="url(#cf-fire)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 25 72 L 142 92" stroke="url(#cf-fire)" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M 10 90 L 144 98" stroke="url(#cf-fire)" stroke-width="4" stroke-linecap="round"/>
            <path d="M 15 110 L 142 108" stroke="url(#cf-fire)" stroke-width="3" stroke-linecap="round"/>
            <path d="M 30 130 L 140 118" stroke="url(#cf-fire)" stroke-width="2" stroke-linecap="round"/>
            
            <circle cx="60" cy="78" r="3" fill="#EF4444"/>
            <circle cx="100" cy="94" r="4" fill="#F97316"/>
            <circle cx="80" cy="115" r="3.5" fill="#EF4444"/>

            <rect x="18" y="160" width="105" height="22" rx="4" fill="rgba(220,38,38,0.15)" stroke="#DC2626" stroke-width="0.8"/>
            <text x="70" y="172" fill="#F87171" font-family="monospace" font-size="6" font-weight="bold" text-anchor="middle">3.8 Tbps ATTACK FLOOD</text>
            <text x="70" y="179" fill="rgba(248,113,113,0.7)" font-family="monospace" font-size="4.8" text-anchor="middle">SYN/UDP Amplification</text>

            <!-- The eBPF / XDP Forcefield Shield (Center) -->
            <rect x="146" y="32" width="14" height="144" rx="7" fill="url(#cf-shield-glow)" filter="url(#glow-cf)"/>
            <line x1="153" y1="36" x2="153" y2="172" stroke="#FFFFFF" stroke-width="1.8"/>

            <!-- Shield sparks and deflection downward -->
            <path d="M 148 90 Q 125 125 110 155" stroke="#F59E0B" stroke-width="2" stroke-dasharray="2,2"/>
            <path d="M 148 105 Q 130 140 120 168" stroke="#EF4444" stroke-width="2" stroke-dasharray="2,2"/>
            <circle cx="148" cy="98" r="5" fill="#F59E0B" filter="url(#glow-cf)"/>

            <g transform="translate(168, 48)">
              <!-- Legitimate Clean Packet Stream Passing Through (Right) -->
              <path d="M 0 52 L 130 52" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
              <polygon points="135,52 127,48 127,56" fill="#10B981"/>
              
              <circle cx="45" cy="52" r="3.5" fill="#34D399"/>
              <circle cx="85" cy="52" r="3.5" fill="#34D399"/>

              <rect x="18" y="70" width="112" height="34" rx="4" fill="rgba(16,185,129,0.12)" stroke="#10B981" stroke-width="1"/>
              <text x="74" y="84" fill="#34D399" font-family="monospace" font-size="6.5" font-weight="bold" text-anchor="middle">XDP_DROP IN NIC DRIVER</text>
              <text x="74" y="93" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="5" text-anchor="middle">Inspection: &lt; 14 Nanoseconds</text>
              <text x="74" y="100" fill="#10B981" font-family="monospace" font-size="4.8" text-anchor="middle">Clean traffic &rarr; Linux kernel</text>
            </g>
          </svg>
        `
      },
      {
        id: "figma-wasm-crdt",
        company: "Figma",
        blog: "Figma Engineering",
        title: "WebAssembly, CRDTs and Real-Time Multiplayer",
        summary: "Achieving zero-latency collaborative canvas synchronization at 60 FPS in web browsers: compiling the core C++ rendering and layout engine to WebAssembly with conflict-free document replication.",
        takeaways: [
          "C++ vector layout system cross-compiled to WebAssembly for raw memory speed.",
          "Property-level operational transformation tree resolved client-side without locking.",
          "Custom WebGL pipeline directly referencing WASM linear memory with zero copy overhead."
        ],
        tag: "WebAssembly",
        tape: "push-pin",
        coords: { bottom: "10%", left: "5%", rotate: -8 },
        annotation: "60 FPS collaborative canvas",
        readingTime: "11 min",
        level: "Graphics / Frontend",
        url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="fig-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.8" fill="rgba(255,255,255,0.15)"/>
              </pattern>
              <filter id="glow-fig" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#121826"/>
            <rect width="320" height="200" fill="url(#fig-dots)"/>

            <!-- Top Tool & Frame Rate Bar -->
            <rect x="15" y="12" width="290" height="24" rx="4" fill="#1A2234" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
            <text x="26" y="27" fill="#38BDF8" font-family="monospace" font-size="6.5" font-weight="bold">FIGMA VECTOR CANVAS</text>
            
            <rect x="215" y="16" width="82" height="16" rx="3" fill="rgba(16,185,129,0.15)" stroke="#10B981" stroke-width="0.8"/>
            <circle cx="225" cy="24" r="2.5" fill="#10B981"/>
            <text x="232" y="27" fill="#34D399" font-family="monospace" font-size="5.5" font-weight="bold">60.0 FPS &middot; 16.6ms</text>

            <!-- The Vector Drawing: Smooth S-Curve with Bezier Tangents -->
            <line x1="50" y1="120" x2="90" y2="55" stroke="rgba(56,189,248,0.5)" stroke-width="1.2" stroke-dasharray="2,2"/>
            <line x1="260" y1="145" x2="200" y2="175" stroke="rgba(245,158,11,0.5)" stroke-width="1.2" stroke-dasharray="2,2"/>
            <circle cx="90" cy="55" r="4" fill="#0284C7" stroke="#38BDF8" stroke-width="1.5"/>
            <circle cx="200" cy="175" r="4" fill="#B45309" stroke="#F59E0B" stroke-width="1.5"/>

            <!-- Main Bezier Spline -->
            <path d="M 50 120 C 90 55, 170 50, 200 110 C 220 150, 240 160, 260 145" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" filter="url(#glow-fig)"/>

            <!-- Anchor Points -->
            <rect x="46" y="116" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="196" y="106" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>
            <rect x="256" y="141" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#0284C7" stroke-width="1.8"/>

            <!-- Collaborative Multiplayer Cursors -->
            <!-- Cursor 1: Sarah (Cyan) -->
            <g transform="translate(196, 75)">
              <polygon points="0,0 4,14 7,10 12,12 13,9 8,8 14,5" fill="#0284C7" stroke="#FFFFFF" stroke-width="0.8"/>
              <rect x="12" y="10" width="54" height="14" rx="3" fill="#0284C7"/>
              <text x="39" y="19" fill="#FFFFFF" font-family="sans-serif" font-size="5.5" font-weight="600" text-anchor="middle">sarah.c++</text>
            </g>

            <!-- Cursor 2: Dylan (Amber) -->
            <g transform="translate(86, 42)">
              <polygon points="0,0 4,14 7,10 12,12 13,9 8,8 14,5" fill="#D97706" stroke="#FFFFFF" stroke-width="0.8"/>
              <rect x="12" y="8" width="50" height="14" rx="3" fill="#D97706"/>
              <text x="37" y="17" fill="#FFFFFF" font-family="sans-serif" font-size="5.5" font-weight="600" text-anchor="middle">dylan_wasm</text>
            </g>

            <!-- Cursor 3: Koji (Emerald) -->
            <g transform="translate(240, 125)">
              <polygon points="0,0 4,14 7,10 12,12 13,9 8,8 14,5" fill="#059669" stroke="#FFFFFF" stroke-width="0.8"/>
              <rect x="12" y="8" width="44" height="14" rx="3" fill="#059669"/>
              <text x="34" y="17" fill="#FFFFFF" font-family="sans-serif" font-size="5.5" font-weight="600" text-anchor="middle">koji.crdt</text>
            </g>

            <!-- Bottom Spec Bar -->
            <rect x="15" y="165" width="160" height="22" rx="4" fill="#1A2234" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>
            <text x="24" y="178" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="5.5">WASM C++ Layout &middot; Zero-Copy WebGL</text>
          </svg>
        `
      },
      {
        id: "uber-schemaless-trip",
        company: "Uber",
        blog: "Uber Engineering",
        title: "Schemaless: Uber's Trip Storage at Petabyte Scale",
        summary: "How Uber abandoned MySQL single-instance sharding to build Schemaless on top of append-only Cassandra storage nodes, guaranteeing zero downtime during trip surge events.",
        takeaways: [
          "Append-only cell architecture ensures no in-place mutation locks.",
          "Secondary index worker processes asynchronously parse mutation buffers.",
          "Tiered storage transitions historical trip data to compressed columnar blocks."
        ],
        tag: "Databases",
        tape: "tape-scotch-center",
        coords: { top: "54%", left: "3%", rotate: 4 },
        annotation: "How Uber abandoned MySQL",
        readingTime: "10 min",
        level: "Principal / Data Systems",
        url: "https://www.uber.com/us/en/blog/schemaless-part-one-mysql-datastore/",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-ub" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#080C14"/>

            <!-- Top Title -->
            <text x="18" y="24" fill="rgba(255,255,255,0.75)" font-family="monospace" font-size="6.5" font-weight="bold">GEOSPATIAL H3 INDEX &middot; SCHEMALESS STORAGE</text>
            <text x="302" y="24" fill="#00B8D9" font-family="monospace" font-size="6.5" text-anchor="end">15.8B TRIPS</text>

            <!-- City street map grid lines in background -->
            <path d="M 0 50 L 320 70 M 0 110 L 320 95 M 0 150 L 320 160" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>
            <path d="M 60 0 L 80 200 M 140 0 L 130 200 M 210 0 L 225 200 M 280 0 L 270 200" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>

            <!-- H3 Hexagons -->
            <!-- Hex 1 (x: 120, y: 95) -->
            <polygon points="120,75 140,86 140,108 120,119 100,108 100,86" fill="rgba(0,184,217,0.12)" stroke="#00B8D9" stroke-width="1.2"/>
            <text x="120" y="99" fill="#00B8D9" font-family="monospace" font-size="5" text-anchor="middle">H3: 88283082</text>

            <!-- Hex 2 (Surge Hex, x: 160, y: 72) -->
            <polygon points="160,52 180,63 180,85 160,96 140,85 140,63" fill="rgba(245,158,11,0.18)" stroke="#F59E0B" stroke-width="1.4" filter="url(#glow-ub)"/>
            <text x="160" y="76" fill="#FBBF24" font-family="monospace" font-size="5" font-weight="bold" text-anchor="middle">2.2x SURGE</text>

            <!-- Hex 3 (x: 160, y: 118) -->
            <polygon points="160,98 180,109 180,131 160,142 140,131 140,109" fill="rgba(0,184,217,0.08)" stroke="#00B8D9" stroke-width="1"/>

            <!-- Hex 4 (x: 80, y: 72) -->
            <polygon points="80,52 100,63 100,85 80,96 60,85 60,63" fill="rgba(0,184,217,0.08)" stroke="#00B8D9" stroke-width="1"/>

            <!-- Glowing Neon GPS Trip Trajectory -->
            <path d="M 35 150 Q 80 120 120 95 T 160 72 T 240 60 T 290 85" fill="none" stroke="#00B8D9" stroke-width="2.5" stroke-linecap="round" filter="url(#glow-ub)"/>
            
            <!-- Pickup Pin -->
            <circle cx="35" cy="150" r="6" fill="#10B981" filter="url(#glow-ub)"/>
            <circle cx="35" cy="150" r="2.5" fill="#FFFFFF"/>
            <text x="35" y="165" fill="#34D399" font-family="monospace" font-size="5" text-anchor="middle">PICKUP</text>

            <!-- Dropoff Pin -->
            <circle cx="290" cy="85" r="6" fill="#F59E0B" filter="url(#glow-ub)"/>
            <circle cx="290" cy="85" r="2.5" fill="#FFFFFF"/>
            <text x="290" y="100" fill="#FBBF24" font-family="monospace" font-size="5" text-anchor="middle">DROPOFF</text>

            <!-- Schemaless Append-Only Columnar Shard Stack -->
            <g transform="translate(195, 128)">
              <rect width="110" height="54" rx="4" fill="#0F1522" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>
              <text x="10" y="13" fill="#38BDF8" font-family="monospace" font-size="5.5" font-weight="bold">SCHEMALESS LOG</text>
              <rect x="10" y="18" width="90" height="9" rx="2" fill="rgba(0,184,217,0.15)"/>
              <text x="14" y="25" fill="#00B8D9" font-family="monospace" font-size="4.5">cell_001 &middot; ts:1711283000</text>
              
              <rect x="10" y="29" width="90" height="9" rx="2" fill="rgba(16,185,129,0.15)"/>
              <text x="14" y="36" fill="#34D399" font-family="monospace" font-size="4.5">cell_002 &middot; ts:1711283001 [APPEND]</text>

              <rect x="10" y="40" width="90" height="9" rx="2" fill="rgba(245,158,11,0.15)"/>
              <text x="14" y="47" fill="#FBBF24" font-family="monospace" font-size="4.5">cell_003 &middot; ts:1711283002 [APPEND]</text>
            </g>
          </svg>
        `
      },
      {
        id: "google-spanner-truetime",
        company: "Google",
        blog: "Google Research",
        title: "Spanner: Globally-Distributed Database with TrueTime",
        summary: "Providing externally consistent distributed ACID transactions at worldwide scale through synchronized atomic clocks and GPS receivers with bounded timing uncertainty.",
        takeaways: [
          "TrueTime API exposes time intervals [earliest, latest] with guaranteed bounds.",
          "Two-phase locking combined with Paxos group leaders enforces linearizable serializability.",
          "Wait-out-the-uncertainty commit protocol ensures causal transaction order worldwide."
        ],
        tag: "Distributed Systems",
        tape: "tape-washi-top",
        coords: { top: "52%", right: "3%", rotate: -5 },
        annotation: "External consistency via atomic clocks",
        readingTime: "14 min",
        level: "Principal / Database Architect",
        url: "https://research.google/pubs/spanner-googles-globally-distributed-database/",
        diagram: `
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-sp" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            <rect width="320" height="200" fill="#060916"/>

            <!-- Top Banner -->
            <text x="18" y="22" fill="rgba(255,255,255,0.75)" font-family="monospace" font-size="6.5" font-weight="bold">GOOGLE SPANNER &middot; TRUETIME</text>
            <text x="302" y="22" fill="#EAB308" font-family="monospace" font-size="6.5" text-anchor="end">EXTERNAL CONSISTENCY</text>

            <!-- Cosmic coordinates -->
            <circle cx="160" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.8"/>
            <circle cx="160" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8"/>

            <!-- GPS Satellite Constellation (Orbit Left & Orbit Right) -->
            <!-- Satellite 1 (Left) -->
            <g transform="translate(45, 30)">
              <rect x="-18" y="-4" width="12" height="8" rx="1" fill="#0284C7" stroke="#38BDF8" stroke-width="0.6"/>
              <rect x="6" y="-4" width="12" height="8" rx="1" fill="#0284C7" stroke="#38BDF8" stroke-width="0.6"/>
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>
              <circle cx="0" cy="0" r="2.5" fill="#EAB308"/>
              <path d="M 0 6 L 115 70" stroke="rgba(234,179,8,0.3)" stroke-width="1.2" stroke-dasharray="3,2"/>
            </g>

            <!-- Satellite 2 (Right) -->
            <g transform="translate(275, 30)">
              <rect x="-18" y="-4" width="12" height="8" rx="1" fill="#0284C7" stroke="#38BDF8" stroke-width="0.6"/>
              <rect x="6" y="-4" width="12" height="8" rx="1" fill="#0284C7" stroke="#38BDF8" stroke-width="0.6"/>
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8"/>
              <circle cx="0" cy="0" r="2.5" fill="#EAB308"/>
              <path d="M 0 6 L -115 70" stroke="rgba(234,179,8,0.3)" stroke-width="1.2" stroke-dasharray="3,2"/>
            </g>

            <!-- Center Quantum TrueTime Band -->
            <g transform="translate(80, 56)">
              <rect width="160" height="42" rx="5" fill="#0D1424" stroke="rgba(234,179,8,0.4)" stroke-width="1"/>
              <!-- Oscillator wave -->
              <path d="M 8 21 Q 18 6, 28 21 T 48 21 T 68 21 T 88 21 T 108 21 T 128 21 T 148 21" fill="none" stroke="#EAB308" stroke-width="1.8" filter="url(#glow-sp)"/>
              
              <line x1="80" y1="4" x2="80" y2="38" stroke="#EF4444" stroke-width="1.5"/>
              <text x="80" y="36" fill="#F87171" font-family="monospace" font-size="5" text-anchor="middle">TT.now()</text>

              <line x1="55" y1="10" x2="55" y2="32" stroke="#EAB308" stroke-width="1" stroke-dasharray="2,1"/>
              <line x1="105" y1="10" x2="105" y2="32" stroke="#EAB308" stroke-width="1" stroke-dasharray="2,1"/>
              <text x="55" y="8" fill="#FDE047" font-family="monospace" font-size="4.5" text-anchor="middle">t.earliest</text>
              <text x="105" y="8" fill="#FDE047" font-family="monospace" font-size="4.5" text-anchor="middle">t.latest</text>
              <text x="80" y="47" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="5" text-anchor="middle">UNCERTAINTY &epsilon; &le; 7ms &middot; WAIT-OUT PROTOCOL</text>
            </g>

            <!-- Interlocking Paxos Consensus Rings Below -->
            <g transform="translate(160, 150)">
              <circle cx="-50" cy="0" r="22" fill="rgba(56,189,248,0.08)" stroke="#38BDF8" stroke-width="1.2"/>
              <circle cx="-50" cy="0" r="4" fill="#38BDF8"/>
              <text x="-50" y="14" fill="#38BDF8" font-family="monospace" font-size="4.5" text-anchor="middle">PAXOS A</text>

              <!-- Ring 2 (Leader) -->
              <circle cx="0" cy="0" r="24" fill="rgba(16,185,129,0.12)" stroke="#10B981" stroke-width="1.5" filter="url(#glow-sp)"/>
              <circle cx="0" cy="0" r="5" fill="#10B981"/>
              <text x="0" y="15" fill="#34D399" font-family="monospace" font-size="5" font-weight="bold" text-anchor="middle">LEADER</text>

              <circle cx="50" cy="0" r="22" fill="rgba(56,189,248,0.08)" stroke="#38BDF8" stroke-width="1.2"/>
              <circle cx="50" cy="0" r="4" fill="#38BDF8"/>
              <text x="50" y="14" fill="#38BDF8" font-family="monospace" font-size="4.5" text-anchor="middle">PAXOS B</text>

              <line x1="-28" y1="0" x2="-24" y2="0" stroke="#FFFFFF" stroke-width="1"/>
              <line x1="24" y1="0" x2="28" y2="0" stroke="#FFFFFF" stroke-width="1"/>
            </g>
          </svg>
        `
      },
      {
        id: "github-git-storage",
        company: "GitHub",
        blog: "GitHub Engineering",
        title: "How GitHub Stores Hundreds of Millions of Repositories",
        summary: "The evolution of Spokes, Git packfiles, delta compression, and multi-datacenter quorum replication keeping 200M+ codebases durable with sub-millisecond clone starts.",
        takeaways: [
          "Spokes orchestrates 3-way read/write replication for every git push.",
          "Bitmap packfile indices allow instant object negotiation without walking graphs.",
          "Geometric repacking keeps repository size constant during high commit volumes."
        ],
        tag: "Storage",
        readingTime: "9 min",
        level: "Senior / Storage Infrastructure",
        url: "https://github.blog/engineering/introducing-dgit/"
      },
      {
        id: "discord-scylladb-migration",
        company: "Discord",
        blog: "Discord Blog",
        title: "How Discord Stores Trillions of Messages",
        summary: "How Discord eliminated catastrophic p99 tail latency spikes and JVM garbage collection pauses by migrating trillions of messages from Apache Cassandra to ScyllaDB in C++.",
        takeaways: [
          "JVM GC pauses previously caused cascading p99 latency storms under message spikes.",
          "ScyllaDB's thread-per-core asynchronous architecture delivers deterministic <5ms p99s.",
          "Custom Rust intermediate migration pipeline synced live writes without downtime."
        ],
        tag: "Databases",
        annotation: "Taming p99 tail latency storms",
        readingTime: "8 min",
        level: "Senior / Performance",
        url: "https://discord.com/blog/how-discord-stores-trillions-of-messages"
      },
      {
        id: "shopify-flash-sales",
        company: "Shopify",
        blog: "Shopify Engineering",
        title: "Surviving Black Friday: 10x Baseline Flash Spikes",
        summary: "How Shopify provisions its global multi-tenant Rails monolith on Kubernetes, caching millions of inventory counts in memory to handle $9.3B in weekend sales.",
        takeaways: [
          "MySQL read replica load shedding automatically shifts traffic during heavy checkout surges.",
          "Ephemeral cache warming prevents thundering herds on critical product pages.",
          "Pod autoscaling based on ingress request rate rather than CPU utilization."
        ],
        tag: "Distributed Systems",
        readingTime: "11 min",
        level: "Staff / Production",
        url: "https://shopify.engineering/resiliency-planning-for-high-traffic-events"
      },
      {
        id: "cockroachdb-scaling-raft",
        company: "CockroachDB",
        blog: "Cockroach Labs Blog",
        title: "Scaling Raft: Distributed Consensus at Mission-Critical Scale",
        summary: "How CockroachDB implements Multi-Raft to manage millions of distinct consensus groups across globally distributed clusters, preventing split-brain leader elections and ensuring zero-loss failover.",
        takeaways: [
          "Multi-Raft splits cluster ranges into independent consensus groups to scale throughput linearly.",
          "Leader leases prevent stale reads without requiring a full Paxos/Raft round-trip on every query.",
          "Joint consensus membership changes allow dynamic node additions without stopping live writes."
        ],
        tag: "Distributed Systems",
        annotation: "Multi-Raft consensus across clusters",
        readingTime: "10 min",
        level: "Staff / Distributed Systems",
        url: "https://www.cockroachlabs.com/blog/scaling-raft/"
      }
    ];

export const EDITORIAL_SUGGESTIONS = [
  { text: "How does Stripe prevent duplicate payments with idempotency keys?", tag: "Payments" },
  { text: "Automated multi-region active-active database failover without data loss", tag: "High Availability" },
  { text: "Dropping multi-terabit volumetric DDoS at wire speed with eBPF and XDP", tag: "Networking" },
  { text: "How Google Spanner achieves external consistency with TrueTime atomic clocks", tag: "Consensus" },
  { text: "Why did Uber abandon MySQL for Schemaless append-only storage?", tag: "Storage" },
  { text: "Distributed consensus with Raft vs Paxos at scale", tag: "Distributed Systems" },
  { text: "Real-time 60 FPS collaborative canvas with WebAssembly and CRDTs", tag: "Performance" },
  { text: "Migrating billions of chat messages from Cassandra to ScyllaDB", tag: "NoSQL Databases" }
];

