import { ModularCourse } from '../types';

export const INITIAL_MODULAR_COURSES: ModularCourse[] = [
  // --- MÓDULO I: SEPTIEMBRE - OCTUBRE ---
  {
    id: 'mod-1',
    codeNumber: '199226',
    credits: 2,
    hs: 2,
    name: 'APRENDIZAJE Y MODELOS PEDAGOGICOS',
    shortName: 'Aprendizaje y Modelos Pedagógicos',
    professor: 'YOHANA ARIAS RODRIGUEZ',
    timeRange: '2:45 PM A 5:00 PM',
    startTime24: '14:45',
    endTime24: '17:00',
    day: 'Viernes',
    datesDescription: '11, 18, 25 de septiembre y 2 de octubre',
    exactDates: ['2026-09-11', '2026-09-18', '2026-09-25', '2026-10-02'],
    group: 'C1',
    moduleName: 'Septiembre - Octubre',
    color: '#fee2e2', // soft rose
    classroom: 'Por asignar'
  },
  {
    id: 'mod-2',
    codeNumber: '199121',
    credits: 2,
    hs: 2,
    name: 'EDUCACIÓN MATEMATICA EN LA BÁSICA PRIMARIA',
    shortName: 'Educación Matemática',
    professor: 'ESTEBAN MENDOZA MUÑOZ',
    timeRange: '7:00 AM a 9:15 AM',
    startTime24: '07:00',
    endTime24: '09:15',
    day: 'Sabado',
    datesDescription: '12, 19 y 26 de septiembre y 3 de octubre',
    exactDates: ['2026-09-12', '2026-09-19', '2026-09-26', '2026-10-03'],
    group: 'C1',
    moduleName: 'Septiembre - Octubre',
    color: '#dcfce7', // soft green
    classroom: 'Por asignar'
  },
  {
    id: 'mod-3',
    codeNumber: '199327',
    credits: 2,
    hs: 2,
    name: 'CIENCIA E INVESTIGACIÓN EDUCATIVA',
    shortName: 'Ciencia e Inv. Educativa',
    professor: 'HOLMER LUIS GONZALEZ MARTINEZ',
    timeRange: '9:30 AM a 11: 45 AM',
    startTime24: '09:30',
    endTime24: '11:45',
    day: 'Sabado',
    datesDescription: '12, 19 y 26 de septiembre y 3 de octubre',
    exactDates: ['2026-09-12', '2026-09-19', '2026-09-26', '2026-10-03'],
    group: 'C1',
    moduleName: 'Septiembre - Octubre',
    color: '#e0e7ff', // soft indigo
    classroom: 'Por asignar'
  },
  {
    id: 'mod-4',
    codeNumber: '199429',
    credits: 2,
    hs: 2,
    name: 'INGLES II',
    shortName: 'Inglés II',
    professor: 'DANIEL ALBERTO CASTELLANOS LOPEZ',
    timeRange: '12:45 PM a 3:00 pm',
    startTime24: '12:45',
    endTime24: '15:00',
    day: 'Sabado',
    datesDescription: '12, 19 y 26 de septiembre y 3 de octubre',
    exactDates: ['2026-09-12', '2026-09-19', '2026-09-26', '2026-10-03'],
    group: 'C1',
    moduleName: 'Septiembre - Octubre',
    color: '#fef3c7', // soft amber
    classroom: 'Por asignar'
  },

  // --- MÓDULO II: OCTUBRE ---
  {
    id: 'mod-5',
    codeNumber: '199224',
    credits: 2,
    hs: 2,
    name: 'RECURSOS DIDÁCTICOS PARA EL APRENDIZAJE',
    shortName: 'Recursos Didácticos',
    professor: 'MAIRENE GONZALEZ GOMEZ',
    timeRange: '2:45 PM A 5:00 PM',
    startTime24: '14:45',
    endTime24: '17:00',
    day: 'Viernes',
    datesDescription: '9, 16, 23, 30 de octubre',
    exactDates: ['2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30'],
    group: 'C1',
    moduleName: 'Octubre',
    color: '#dbeafe', // soft blue
    classroom: 'Por asignar'
  },
  {
    id: 'mod-6',
    codeNumber: '199225',
    credits: 2,
    hs: 2,
    name: 'DISEÑO Y DESARROLLO CURRICULAR',
    shortName: 'Diseño Curricular',
    professor: 'KATERIN PUSHAINA BLANCO',
    timeRange: '7:00 AM a 9:15 AM',
    startTime24: '07:00',
    endTime24: '09:15',
    day: 'Sabado',
    datesDescription: '10, 17, 24 y 31 de octubre',
    exactDates: ['2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'],
    group: 'C1',
    moduleName: 'Octubre',
    color: '#f1f5f9', // soft slate
    classroom: 'Por asignar'
  },
  {
    id: 'mod-7',
    codeNumber: '199428',
    credits: 2,
    hs: 2,
    name: 'DIVERSIDAD, ETNICIDAD Y MULTICULTURALIDAD EN LA BÁSICA PRIMARIA',
    shortName: 'Diversidad y Multiculturalidad',
    professor: 'KATERINE PAOLA MARTINEZ PABON',
    timeRange: '9:30 AM a 11: 45 AM',
    startTime24: '09:30',
    endTime24: '11:45',
    day: 'Sabado',
    datesDescription: '10, 17, 24 y 31 de octubre',
    exactDates: ['2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'],
    group: 'C1',
    moduleName: 'Octubre',
    color: '#ccfbf1', // soft teal
    classroom: 'Por asignar'
  },
  {
    id: 'mod-8',
    codeNumber: '199122',
    credits: 2,
    hs: 2,
    name: 'HABILIDADES LECTOESCRITORAS',
    shortName: 'Habilidades Lectoescritoras',
    professor: 'GERARDO BRITO ARIZA',
    timeRange: '12:45 PM a 3:00 pm',
    startTime24: '12:45',
    endTime24: '15:00',
    day: 'Sabado',
    datesDescription: '10, 17, 24 y 31 de octubre',
    exactDates: ['2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'],
    group: 'C1',
    moduleName: 'Octubre',
    color: '#ffedd5', // soft orange
    classroom: 'Por asignar'
  },

  // --- MÓDULO III: NOVIEMBRE ---
  {
    id: 'mod-9',
    codeNumber: '199123',
    credits: 2,
    hs: 2,
    name: 'PSICOLOGIA DEL DESARROLLO',
    shortName: 'Psicología del Desarrollo',
    professor: 'DAYANA ROYS',
    timeRange: '2:45 PM A 5:00 PM',
    startTime24: '14:45',
    endTime24: '17:00',
    day: 'Viernes',
    datesDescription: '6, 13, 20 y 27 de noviembre',
    exactDates: ['2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27'],
    group: 'C1',
    moduleName: 'Noviembre',
    color: '#fae8ff', // soft fuchsia
    classroom: 'Por asignar'
  }
];

export const MODULAR_STUDENT_INFO = {
  university: 'UNIVERSIDAD DE LA GUAJIRA',
  program: 'LICENCIATURA EN EDUCACIÓN BÁSICA PRIMARIA',
  group: 'GRUPO C1',
  pensum: '5596',
  semester: 'PRIMERO',
  period: '2026-2',
  modality: 'A Distancia / Modular (Viernes y Sábados)',
  campus: 'Ampliación Uribia'
};
