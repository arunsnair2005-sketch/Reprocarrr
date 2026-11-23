export type OrganId =
  | 'uterus'
  | 'right-ovary'
  | 'left-ovary'
  | 'right-tube'
  | 'left-tube'
  | 'cervix'
  | 'fimbriae';

export interface OrganInfo {
  id: OrganId;
  name: string;
  latinName: string;
  region: string;
  primaryFunction: string;
  description: string;
  educationalPoints: string[];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface JourneyScene {
  id: string;
  index: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  annotationLabel: string;
  focusOrgans: OrganId[] | 'all';
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  modelRotation: [number, number, number];
  modelOffset: [number, number, number];
  hormoneParticleIntensity: number;
  lightIntensity: number;
  bgTone: string;
}

export interface ResearchTopic {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  details: { heading: string; text: string }[];
}

export interface CyclePhase {
  id: string;
  name: string;
  typicalWindow: string;
  hormonalTone: string;
  tissueState: string;
  overview: string;
  physiologicalNotes: string[];
}

export interface ReferenceItem {
  id: string;
  title: string;
  organization: string;
  category: 'Anatomy' | 'Endocrinology' | 'Cycle Physiology' | 'Fertility Literacy' | 'Clinical Guidance';
  yearOrEdition: string;
  summary: string;
  url?: string;
  userAdded?: boolean;
}

export const EDITORIAL_IMAGES = {
  endometrium: '/src/assets/images/editorial_cellular_endometrium_1795431986698.jpg',
  hormones: '/src/assets/images/editorial_hormonal_resonance_1795431987659.jpg',
  follicle: '/src/assets/images/editorial_ovarian_follicle_1795431987681.jpg',
  atelier: '/src/assets/images/editorial_reprocare_atelier_1795431988616.jpg',
} as const;

export const ORGANS: OrganInfo[] = [
  {
    id: 'uterus',
    name: 'Uterus',
    latinName: 'Uterus (Corpus & Fundus)',
    region: 'Central Pelvic Cavity',
    primaryFunction: 'Cyclical endometrial renewal, gestation support, and rhythmic myometrial contraction',
    description:
      'A hollow, pear-shaped muscular organ situated centrally in the pelvis. Its wall consists of three distinct layers: the outer serosal perimetrium, a thick smooth-muscle myometrium, and the inner vascular endometrium that responds dynamically to ovarian hormones.',
    educationalPoints: [
      'The rounded upper dome above the tubal openings is the fundus; the main central chamber is the uterine body (corpus).',
      'Endometrial tissue thickens during the proliferative and secretory phases and sheds during menstruation when implantation does not occur.',
      'Smooth muscle fibers in the myometrium adapt markedly in elasticity and vascular supply across reproductive life stages.',
    ],
    cameraPos: [0.35, 0.45, 3.85],
    cameraTarget: [0, 0.28, 0],
  },
  {
    id: 'right-ovary',
    name: 'Right Ovary',
    latinName: 'Ovarium Dextrum',
    region: 'Right Pelvic Sidewall',
    primaryFunction: 'Oocyte maturation and cyclical secretion of estradiol and progesterone',
    description:
      'An almond-shaped paired gonad suspended near the lateral pelvic wall by the ovarian and suspensory ligaments. It houses primordial follicles within its outer cortex and orchestrates endocrine signaling across the menstrual cycle.',
    educationalPoints: [
      'Each month, a cohort of follicles begins growing under FSH stimulation, typically culminating in one dominant follicle.',
      'Granulosa and theca cells synthesize estrogens prior to ovulation and progesterone via the corpus luteum afterward.',
      'Ovulation generally alternates or occurs independently between the left and right ovaries across cycles.',
    ],
    cameraPos: [-2.05, 0.3, 2.75],
    cameraTarget: [-1.72, -0.02, -0.18],
  },
  {
    id: 'left-ovary',
    name: 'Left Ovary',
    latinName: 'Ovarium Sinistrum',
    region: 'Left Pelvic Sidewall',
    primaryFunction: 'Follicular development, ovulation, and endocrine hormone synthesis',
    description:
      'Paired counterpart to the right ovary, nestled below the arched curve of the left fallopian tube and embraced by delicate fimbriae during ovulation. Its dual endocrine and gametogenic roles anchor reproductive physiology.',
    educationalPoints: [
      'After releasing a mature oocyte, the ruptured follicle transforms into the corpus luteum, a temporary endocrine structure.',
      'Ovarian vascular supply arrives directly via the ovarian artery and drains through the pampiniform-like ovarian venous plexus.',
      'Ovarian function communicates continuously with the hypothalamus and anterior pituitary through hormonal feedback loops.',
    ],
    cameraPos: [2.05, 0.3, 2.75],
    cameraTarget: [1.72, -0.02, -0.18],
  },
  {
    id: 'right-tube',
    name: 'Right Fallopian Tube',
    latinName: 'Tuba Uterina Dextra',
    region: 'Right Upper Lateral Arch',
    primaryFunction: 'Oocyte capture and cilia-driven transport toward the uterine cavity',
    description:
      'A muscular, cilia-lined conduit arching gracefully from the right uterine cornu toward the right ovary. Anatomically divided into the intramural segment, narrow isthmus, wider curved ampulla, and flared infundibulum.',
    educationalPoints: [
      'Microscopic hair-like cilia and gentle peristaltic waves guide the oocyte medially toward the uterus.',
      'The ampulla represents the widest, most tortuous portion of the tube where fertilization most commonly takes place.',
      'Tubal fluid provides essential metabolic support for gametes and early cellular cleavage.',
    ],
    cameraPos: [-1.45, 1.35, 3.35],
    cameraTarget: [-1.25, 0.85, -0.05],
  },
  {
    id: 'left-tube',
    name: 'Left Fallopian Tube',
    latinName: 'Tuba Uterina Sinistra',
    region: 'Left Upper Lateral Arch',
    primaryFunction: 'Protected transport conduit connecting peritoneal ovarian space to the uterus',
    description:
      'Extending laterally from the left uterine horn, this curved duct bridges the ovarian surface and the endometrial cavity. Its folded mucosal lining maximizes surface area for ciliary sweeping and nutrient exchange.',
    educationalPoints: [
      'Smooth muscle layers contract rhythmically in response to shifting estrogen and progesterone concentrations.',
      'The narrow isthmus acts as a physiological gatekeeper before entry into the uterine cavity.',
      'Paired tubal architecture provides bilateral redundancy in reproductive transport.',
    ],
    cameraPos: [1.45, 1.35, 3.35],
    cameraTarget: [1.25, 0.85, -0.05],
  },
  {
    id: 'cervix',
    name: 'Cervix',
    latinName: 'Cervix Uteri',
    region: 'Inferior Uterine Segment',
    primaryFunction: 'Biochemical mucus regulation and structural barrier between vagina and uterus',
    description:
      'The firm, cylindrical lower neck of the uterus connecting the uterine cavity through the endocervical canal to the vaginal vault. Rich in collagen and specialized mucus-secreting crypts responsive to estrogen and progesterone.',
    educationalPoints: [
      'Under rising estrogen near ovulation, cervical mucus becomes clear, hydrated, and receptive to sperm motility.',
      'During the luteal phase under progesterone, mucus thickens to form a protective biological barrier.',
      'Its dense fibromuscular matrix provides structural support to the pelvic floor and uterine cavity.',
    ],
    cameraPos: [0.3, -1.25, 3.1],
    cameraTarget: [0, -1.35, 0],
  },
  {
    id: 'fimbriae',
    name: 'Fimbriae',
    latinName: 'Fimbriae Tubae Uterinae',
    region: 'Distal Infundibulum Rim',
    primaryFunction: 'Delicate sweeping capture of the released oocyte at ovulation',
    description:
      'Finger-like, ciliated mucosal fronds crowning the open funnel (infundibulum) of each fallopian tube. Rather than forming a closed seal, they hover gracefully over the ovarian surface and sweep gently during ovulation.',
    educationalPoints: [
      'Ciliated epithelial cells beat in coordinated waves, creating subtle fluid currents across the ovarian surface.',
      'Around ovulation, increased blood flow gently engorges the fimbriae, drawing them closer to the ovulating follicle.',
      'One elongated frond—the fimbria ovarica—physically tethers the tubal opening near the ovary.',
    ],
    cameraPos: [2.55, 0.52, 2.35],
    cameraTarget: [2.05, 0.34, -0.22],
  },
];

export const JOURNEY_SCENES: JourneyScene[] = [
  {
    id: 'scene-01',
    index: '01',
    label: 'Scene 01 — The Complete System',
    title: 'An integrated architecture of renewal.',
    subtitle: 'Bilateral symmetry, muscular precision, and endocrine dialogue.',
    description:
      'Suspended within the pelvic basin, the female reproductive system functions not as isolated parts, but as a continuous feedback network uniting the uterus, paired fallopian conduits, ovaries, and cervix.',
    annotationLabel: 'Complete Pelvic System · Anterior View',
    focusOrgans: 'all',
    cameraPos: [0, 0.25, 6.2],
    cameraTarget: [0, 0.05, 0],
    modelRotation: [0.06, -0.18, 0],
    modelOffset: [0.65, 0.05, 0],
    hormoneParticleIntensity: 0.35,
    lightIntensity: 1.0,
    bgTone: '#12050B',
  },
  {
    id: 'scene-02',
    index: '02',
    label: 'Scene 02 — The Uterus',
    title: 'Layered resilience at the core.',
    subtitle: 'Endometrial responsiveness inside a sculpted smooth-muscle chamber.',
    description:
      'Moving inward toward the midline, the uterus reveals an outer translucent myometrial wall cradling a luminous inner endometrial lining—cyclically rebuilding, vascularizing, and shedding in quiet rhythm with ovarian signals.',
    annotationLabel: 'Uterus · Corpus, Fundus & Endometrial Cavity',
    focusOrgans: ['uterus', 'cervix'],
    cameraPos: [-0.55, 0.38, 3.65],
    cameraTarget: [0.15, 0.2, 0],
    modelRotation: [0.12, 0.22, 0],
    modelOffset: [0.5, 0.02, 0],
    hormoneParticleIntensity: 0.45,
    lightIntensity: 1.25,
    bgTone: '#1B0710',
  },
  {
    id: 'scene-03',
    index: '03',
    label: 'Scene 03 — The Ovaries',
    title: 'Endocrine timekeepers in suspension.',
    subtitle: 'Follicular maturation and pulsing hormonal messengers.',
    description:
      'Gliding laterally toward the ovaries illuminates developing cortical follicles—microscopic reservoirs that synthesize estradiol and progesterone, sending chemical messengers throughout the body in monthly waves.',
    annotationLabel: 'Paired Ovaries · Follicular Cortex & Endocrine Signaling',
    focusOrgans: ['left-ovary', 'right-ovary'],
    cameraPos: [1.55, 0.12, 3.35],
    cameraTarget: [1.05, -0.02, -0.12],
    modelRotation: [0.05, -0.35, 0],
    modelOffset: [-0.15, 0.04, 0],
    hormoneParticleIntensity: 1.0,
    lightIntensity: 1.35,
    bgTone: '#240713',
  },
  {
    id: 'scene-04',
    index: '04',
    label: 'Scene 04 — The Fallopian Tubes',
    title: 'Curved pathways and sweeping fronds.',
    subtitle: 'From the flared fimbriae through the ampullary arch.',
    description:
      'Following the graceful bilateral arches reveals how the infundibulum opens into delicate, petal-like fimbriae. Microscopic cilia and smooth-muscle waves guide the oocyte along the ampullary curve toward the uterus.',
    annotationLabel: 'Fallopian Tubes · Ampulla, Infundibulum & Fimbriae',
    focusOrgans: ['left-tube', 'right-tube', 'fimbriae'],
    cameraPos: [1.35, 1.15, 3.45],
    cameraTarget: [1.2, 0.65, -0.12],
    modelRotation: [0.22, -0.28, 0.04],
    modelOffset: [-0.1, -0.18, 0],
    hormoneParticleIntensity: 0.65,
    lightIntensity: 1.2,
    bgTone: '#1A060F',
  },
  {
    id: 'scene-05',
    index: '05',
    label: 'Scene 05 — The Complete Anatomy',
    title: 'Understand your body. Own your care.',
    subtitle: 'Clarity transforms how we read, question, and advocate for our health.',
    description:
      'Pulling back to view the entire reproductive system in luminous equilibrium reminds us that physiological literacy is foundational—turning abstract biology into visible, intuitive understanding.',
    annotationLabel: 'Holistic Equilibrium · Full Anatomical Architecture',
    focusOrgans: 'all',
    cameraPos: [0, 0.15, 6.7],
    cameraTarget: [0, 0, 0],
    modelRotation: [0.04, 0.16, 0],
    modelOffset: [0.55, 0.02, 0],
    hormoneParticleIntensity: 0.55,
    lightIntensity: 1.15,
    bgTone: '#12050B',
  },
];

export const ANATOMY_RESEARCH_TOPICS: ResearchTopic[] = [
  {
    id: 'uterine-layers',
    title: 'Uterine Structure & Tissue Layers',
    kicker: 'Histology & Biomechanics',
    summary:
      'The uterine wall operates as a three-layered biological composite engineered for both structural strength and monthly cellular renewal.',
    details: [
      {
        heading: 'Endometrium (Inner Lining)',
        text: 'Composed of a deeper basal layer (stratum basale) that remains intact and a superficial functional layer (stratum functionalis) that proliferates, becomes secretory under progesterone, and sheds during menstruation.',
      },
      {
        heading: 'Myometrium (Smooth Muscle Core)',
        text: 'Three interwoven layers of smooth muscle fibers capable of rhythmic peristaltic waves during menstruation and immense structural remodeling during gestation.',
      },
      {
        heading: 'Perimetrium (Outer Serosa)',
        text: 'A thin peritoneal membrane continuous with the broad ligament, minimizing friction against adjacent pelvic organs.',
      },
    ],
  },
  {
    id: 'ovarian-biology',
    title: 'Ovarian Reserve & Follicular Biology',
    kicker: 'Gametogenesis & Steroidogenesis',
    summary:
      'Inside the ovarian cortex, microscopic follicles act simultaneously as protective chambers for oocytes and precision endocrine factories.',
    details: [
      {
        heading: 'Follicular Recruitment',
        text: 'From a lifelong pool established before birth, follicles transition sequentially through primordial, primary, secondary, and antral stages over several months before entering gonadotropin-dependent selection.',
      },
      {
        heading: 'Two-Cell, Two-Gonadotropin Model',
        text: 'LH stimulates theca cells to synthesize androgens, which adjacent granulosa cells convert into estradiol under FSH-activated aromatase enzymes.',
      },
      {
        heading: 'Luteal Transformation',
        text: 'Following ovulation, remaining follicular cells remodel into the corpus luteum, producing progesterone to stabilize the secretory endometrium.',
      },
    ],
  },
  {
    id: 'tubal-transport',
    title: 'Fallopian Transport & Fimbrial Capture',
    kicker: 'Ciliary Dynamics',
    summary:
      'Contrary to static textbook diagrams, the fallopian tube is not fused to the ovary—oocyte capture relies on coordinated fluid currents and muscular sweep.',
    details: [
      {
        heading: 'Infundibulum & Fimbriae',
        text: 'Dense ciliated mucosal folds sweep over the ovulating follicle surface, guiding the cumulus-oocyte complex into the tubal ostium.',
      },
      {
        heading: 'Ampullary Environment',
        text: 'Secretory epithelial cells nourish gametes while opposing ciliary beating and smooth-muscle contractions modulate transit speed.',
      },
      {
        heading: 'Isthmic Gatekeeping',
        text: 'The narrower muscular isthmus regulates timing before the uterine cavity is reached.',
      },
    ],
  },
  {
    id: 'cervical-physiology',
    title: 'Cervical Mucus & Barrier Function',
    kicker: 'Endocervical Crypts',
    summary:
      'The cervix acts as a dynamic biochemical gatekeeper whose secretions shift structurally across the menstrual cycle.',
    details: [
      {
        heading: 'Estrogenic Hydration',
        text: 'Rising pre-ovulatory estradiol increases water and mucin channel organization, producing clear, stretchy cervical fluid that supports sperm survival.',
      },
      {
        heading: 'Progestogenic Mucus Plug',
        text: 'Post-ovulatory progesterone thickens mucin cross-linking, creating a dense protective barrier against ascending microbes.',
      },
      {
        heading: 'Transformation Zone',
        text: 'The junction between endocervical columnar epithelium and ectocervical squamous cells is an area of active cellular turnover monitored during routine preventive screening.',
      },
    ],
  },
];

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: 'menstrual',
    name: 'Menstrual Phase',
    typicalWindow: 'Early Cycle · Days 1–5 (varies individually)',
    hormonalTone: 'Low Estradiol · Low Progesterone',
    tissueState: 'Controlled shedding of functional endometrium',
    overview:
      'When fertilization and implantation do not occur, the corpus luteum regresses, causing progesterone and estradiol to fall. Spiral arteries in the functional endometrium constrict and release, shedding the lining smoothly through the cervix.',
    physiologicalNotes: [
      'Prostaglandins stimulate gentle myometrial contractions to assist endometrial shedding and limit vascular loss.',
      'Simultaneously, the basal endometrial layer remains intact to initiate regeneration, while FSH begins gently rising for the next follicular cohort.',
    ],
  },
  {
    id: 'follicular',
    name: 'Follicular (Proliferative) Phase',
    typicalWindow: 'Pre-Ovulatory · Variable Duration',
    hormonalTone: 'Rising FSH · Steadily Climbing Estradiol',
    tissueState: 'Endometrial regeneration & thickening',
    overview:
      'Anterior pituitary FSH recruits a small cohort of ovarian antral follicles. One dominant follicle emerges and secretes progressively higher levels of estradiol, rebuilding endometrial glands and blood vessels.',
    physiologicalNotes: [
      'Cycle length variation between individuals—and from cycle to cycle—occurs primarily in the length of this follicular phase.',
      'Rising estradiol also stimulates endocervical crypts to begin producing increasingly hydrated cervical fluid.',
    ],
  },
  {
    id: 'ovulatory',
    name: 'Ovulatory Window',
    typicalWindow: 'Mid-Cycle Transition',
    hormonalTone: 'Peak Estradiol · Sharp LH & FSH Surge',
    tissueState: 'Follicular rupture & fimbrial oocyte capture',
    overview:
      'Sustained high estradiol shifts hypothalamic-pituitary feedback from negative to positive, triggering a sharp surge in Luteinizing Hormone (LH). This surge initiates final oocyte maturation and enzymatic thinning of the follicle wall, releasing the oocyte.',
    physiologicalNotes: [
      'The released oocyte remains viable for fertilization for a relatively brief window following ovulation.',
      'Fimbriae sweep gently over the ovarian surface to guide the oocyte into the fallopian ampulla.',
    ],
  },
  {
    id: 'luteal',
    name: 'Luteal (Secretory) Phase',
    typicalWindow: 'Post-Ovulatory · Typically ~12–14 Days',
    hormonalTone: 'Dominant Progesterone · Moderate Estradiol',
    tissueState: 'Secretory endometrial maturation',
    overview:
      'The ruptured follicle reorganizes into the corpus luteum and secretes progesterone alongside moderate estradiol. Progesterone halts further endometrial proliferation, transforms glands into nutrient-secreting structures, and raises basal metabolic temperature slightly.',
    physiologicalNotes: [
      'Progesterone also calms myometrial contractility and thickens cervical mucus.',
      'In the absence of an embryonic hCG signal, the corpus luteum naturally involutes, returning hormone levels toward baseline.',
    ],
  },
];

export const INITIAL_REFERENCES: ReferenceItem[] = [
  {
    id: 'ref-who',
    title: 'Reproductive Health & Fertility Literacy Frameworks',
    organization: 'World Health Organization (WHO)',
    category: 'Clinical Guidance',
    yearOrEdition: 'Public Reference Index',
    summary:
      'Foundational global health definitions covering menstrual health, reproductive anatomy education, and preventive care standards.',
    url: 'https://www.who.int/health-topics/sexual-and-reproductive-health',
  },
  {
    id: 'ref-nichd',
    title: 'Menstrual Cycle & Endocrine Regulation Overview',
    organization: 'NIH Eunice Kennedy Shriver National Institute of Child Health and Human Development',
    category: 'Endocrinology',
    yearOrEdition: 'Public Health Monograph',
    summary:
      'Educational synthesis of hypothalamic-pituitary-ovarian axis signaling, gonadotropin pulsatility, and ovulatory physiology.',
    url: 'https://www.nichd.nih.gov/health/topics/menstruation',
  },
  {
    id: 'ref-acog',
    title: 'Patient Education: Menstrual Cycle & Gynecologic Anatomy',
    organization: 'American College of Obstetricians and Gynecologists (ACOG)',
    category: 'Cycle Physiology',
    yearOrEdition: 'Clinical Education Series',
    summary:
      'Medically reviewed guidance explaining normal cycle variability, endometrial physiology, and when to consult a clinician.',
    url: 'https://www.acog.org/womens-health',
  },
  {
    id: 'ref-ta',
    title: 'Terminologia Anatomica — Female Genital System',
    organization: 'Federative International Programme for Anatomical Terminology (FIPAT)',
    category: 'Anatomy',
    yearOrEdition: 'Standardized Nomenclature',
    summary:
      'International standard anatomical terminology for the uterus, uterine tubes, fimbriae, ovaries, and cervix.',
  },
  {
    id: 'ref-guyton',
    title: 'Female Physiology Before Pregnancy & Female Hormones',
    organization: 'Standard Medical Physiology Texts (e.g., Guyton & Hall)',
    category: 'Fertility Literacy',
    yearOrEdition: 'Reference Placeholder for Local Citations',
    summary:
      'Structured slot for verified textbook editions, peer-reviewed DOIs, or institutional curriculum citations added by educators.',
  },
];
