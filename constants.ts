import { CVData, CVStyle } from './types';

// Simple unique ID generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

export const FONT_OPTIONS = [
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
    { name: 'Times New Roman', value: "'Times New Roman', serif" },
    { name: 'Georgia', value: "'Georgia', serif" },
    { name: 'Arial', value: "'Arial', sans-serif" },
    { name: 'Helvetica', value: "'Helvetica', sans-serif" },
    { name: 'Calibri', value: "'Calibri', sans-serif" },
];

export const DEFAULT_STYLE: CVStyle = {
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 'text-sm', // 14px
    lineHeight: 'leading-normal', // 1.5
    margin: 'p-8',
    sectionSpacing: 'mb-4',
    dateFormat: 'Month YYYY',
    pageAlignment: 'left',
    accentColor: '#3b82f6',    // Blue-500
    headingColor: '#1f2937',   // Gray-800
    bodyTextColor: '#374151',   // Gray-700
    headingStyle: 'companyFirst',
    personalInfoColumns: 2,
    personalInfoColumnGap: 2, // rem
    personalInfoRowGap: 0.5, // rem
    personalInfoLabelValueGap: 0.5, //rem
    paperSize: 'A4',
};

export const DEFAULT_CV_DATA: CVData = {
    personalInfo: {
        name: 'Jane Doe',
        jobTitle: 'Senior Frontend Engineer',
        details: [
            { id: generateId(), label: 'Email:', value: 'jane.doe@example.com' },
            { id: generateId(), label: 'Phone:', value: '+1 (555) 123-4567' },
            { id: generateId(), label: 'Website:', value: 'janedoe.dev' },
            { id: generateId(), label: 'LinkedIn:', value: 'linkedin.com/in/janedoe' },
            { id: generateId(), label: 'Location:', value: 'San Francisco, CA' },
        ]
    },
    sections: [
        {
            id: generateId(),
            title: 'Work Experience',
            type: 'Work Experience',
            visible: true,
            layout: 'bullets',
            items: [
                {
                    id: generateId(),
                    jobTitle: 'Senior Frontend Engineer',
                    jobTitleLink: '',
                    jobTitleExtra: 'Contractor',
                    company: 'Tech Innovations Inc.',
                    companyLink: 'techinnovations.example.com',
                    companyExtra: '',
                    location: 'San Francisco, CA',
                    startDate: '2021-01-01',
                    endDate: 'Present',
                    description: '<ul><li>Led the development of a new user-facing dashboard using React, TypeScript, and Tailwind CSS, improving user engagement by 25%.</li><li>Mentored junior developers and conducted code reviews to maintain high code quality.</li><li>Collaborated with UX/UI designers to translate mockups into responsive, high-performance web applications.</li></ul>',
                },
                {
                    id: generateId(),
                    jobTitle: 'Frontend Developer',
                    jobTitleLink: '',
                    jobTitleExtra: '',
                    company: 'Web Solutions Co.',
                    companyLink: '',
                    companyExtra: '',
                    location: 'Austin, TX',
                    startDate: '2018-06-01',
                    endDate: '2020-12-31',
                    description: '<ul><li>Developed and maintained client websites using JavaScript, HTML5, and CSS3.</li><li>Optimized web applications for maximum speed and scalability.</li><li>Worked in an Agile environment to deliver features on a regular basis.</li></ul>',
                },
            ],
        },
        {
            id: generateId(),
            title: 'Education',
            type: 'Education',
            visible: true,
            layout: 'list',
            items: [
                {
                    id: generateId(),
                    degree: 'B.S. in Computer Science',
                    degreeLink: '',
                    degreeExtra: 'With Honors',
                    institution: 'University of Technology',
                    institutionLink: 'u-of-tech.edu',
                    institutionExtra: '',
                    location: 'Cambridge, MA',
                    startDate: '2014-09-01',
                    endDate: '2018-05-31',
                    description: 'Member of the Coding Club.',
                },
            ],
        },
        {
            id: generateId(),
            title: 'Skills',
            type: 'Skills',
            visible: true,
            layout: 'chips',
            items: [
                { id: generateId(), skillName: 'React', level: 'Expert', category: 'Frameworks & Libraries', description: 'Deep experience with Hooks, Context API, and performance optimization techniques.' },
                { id: generateId(), skillName: 'TypeScript', level: 'Expert', category: 'Languages', description: '' },
                { id: generateId(), skillName: 'JavaScript (ES6+)', level: 'Expert', category: 'Languages', description: '' },
                { id: generateId(), skillName: 'Tailwind CSS', level: 'Advanced', category: 'Frameworks & Libraries', description: 'Utilized in multiple projects for rapid, responsive UI development.' },
                { id: generateId(), skillName: 'Node.js', level: 'Intermediate', description: '' },
                { id: generateId(), skillName: 'UI/UX Design', level: 'Advanced', category: 'Design', description: '' },
            ],
        },
        {
            id: generateId(),
            title: 'Projects',
            type: 'Projects',
            visible: true,
            layout: 'bullets',
            items: [
                { id: generateId(), projectName: 'Personal Portfolio Website', link: 'janedoe.dev', description: 'A responsive portfolio built with Next.js and deployed on Vercel.' },
                { id: generateId(), projectName: 'Task Management App', link: 'github.com/jane/task-app', description: 'A full-stack MERN application for managing daily tasks.' },
            ],
        },
        {
            id: generateId(),
            title: 'Certifications',
            type: 'Certifications',
            visible: false,
            layout: 'list',
            items: []
        },
        {
            id: generateId(),
            title: 'Languages',
            type: 'Languages',
            visible: false,
            layout: 'compact',
            displayStyle: 'inline',
            items: []
        }
    ],
};