import { db } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Exam, Question, Subject, Topic } from '../types';

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // 5 Famous Exams Data
    const examsData: Exam[] = [
        {
            id: "exam_upsc_cse",
            name: "UPSC CSE",
            description: "Civil Services Examination for IAS, IPS, IFS, etc.",
            subjects: [
                {
                    id: "subj_upsc_hist",
                    name: "History",
                    icon: "Book",
                    topics: [
                        {
                            id: "topic_upsc_mod_hist",
                            name: "Modern History",
                            description: "Indian Freedom Struggle",
                            content: "History of British India...",
                            subtopics: ["Revolt of 1857", "Gandhian Era"],
                            difficulty: "Hard"
                        }
                    ]
                },
                {
                    id: "subj_upsc_polity",
                    name: "Polity",
                    icon: "Landmark",
                    topics: [
                        {
                            id: "topic_upsc_const",
                            name: "Constitution",
                            description: "Indian Constitution and Polity",
                            content: "Preamble, Fundamental Rights...",
                            subtopics: ["Preamble", "FRs", "DPSP"],
                            difficulty: "Medium"
                        }
                    ]
                }
            ]
        },
        {
            id: "exam_neet_ug",
            name: "NEET UG",
            description: "National Eligibility cum Entrance Test for Medical.",
            subjects: [
                {
                    id: "subj_neet_bio",
                    name: "Biology",
                    icon: "Dna",
                    topics: [
                        {
                            id: "topic_neet_cell",
                            name: "Cell Biology",
                            description: "Unit of Life",
                            content: "Cell structure and functions...",
                            subtopics: ["Cell Cycle", "Cell Division"],
                            difficulty: "Medium"
                        }
                    ]
                },
                {
                    id: "subj_neet_phy",
                    name: "Physics",
                    icon: "Atom",
                    topics: [
                        {
                            id: "topic_neet_mech",
                            name: "Mechanics",
                            description: "Laws of Motion",
                            content: "Newton's laws, Kinematics...",
                            subtopics: ["Kinematics", "Laws of Motion"],
                            difficulty: "Hard"
                        }
                    ]
                }
            ]
        },
        {
            id: "exam_jee_adv",
            name: "JEE Advanced",
            description: "Entrance for IITs.",
            subjects: [
                {
                    id: "subj_jee_math",
                    name: "Mathematics",
                    icon: "Calculator",
                    topics: [
                        {
                            id: "topic_jee_calc",
                            name: "Calculus",
                            description: "Differentiation and Integration",
                            content: "Limits, Continuity, derivatives...",
                            subtopics: ["Limits", "Derivatives"],
                            difficulty: "Hard"
                        }
                    ]
                },
                {
                    id: "subj_jee_chem",
                    name: "Chemistry",
                    icon: "FlaskConical",
                    topics: [
                        {
                            id: "topic_jee_org",
                            name: "Organic Chemistry",
                            description: "Carbon compounds",
                            content: "GOC, Hydrocarbons...",
                            subtopics: ["GOC", "Hydrocarbons"],
                            difficulty: "Medium"
                        }
                    ]
                }
            ]
        },
        {
            id: "exam_cat",
            name: "CAT",
            description: "Common Admission Test for IIMs.",
            subjects: [
                {
                    id: "subj_cat_quant",
                    name: "Quantitative Safety",
                    icon: "Percent",
                    topics: [
                        {
                            id: "topic_cat_arith",
                            name: "Arithmetic",
                            description: "Percentages, PL, SI/CI",
                            content: "Basic arithmetic concepts...",
                            subtopics: ["Profit Loss", "Interest"],
                            difficulty: "Medium"
                        }
                    ]
                },
                {
                    id: "subj_cat_varc",
                    name: "VARC",
                    icon: "BookOpen",
                    topics: [
                        {
                            id: "topic_cat_rc",
                            name: "Reading Comprehension",
                            description: "Passage based questions",
                            content: "Read and answer...",
                            subtopics: ["Inference", "Main Idea"],
                            difficulty: "Hard"
                        }
                    ]
                }
            ]
        },
        {
            id: "exam_gate_cs",
            name: "GATE CS",
            description: "Graduate Aptitude Test in Engineering (CS).",
            subjects: [
                {
                    id: "subj_gate_os",
                    name: "Operating Systems",
                    icon: "Cpu",
                    topics: [
                        {
                            id: "topic_gate_proc",
                            name: "Process Management",
                            description: "Process scheduling and synch",
                            content: "Semaphores, Mutex...",
                            subtopics: ["Scheduling", "Deadlocks"],
                            difficulty: "Hard"
                        }
                    ]
                },
                {
                    id: "subj_gate_ds",
                    name: "Data Structures",
                    icon: "Network",
                    topics: [
                        {
                            id: "topic_gate_tree",
                            name: "Trees and Graphs",
                            description: "Traversals and Algorithms",
                            content: "BFS, DFS...",
                            subtopics: ["BST", "AVL Trees"],
                            difficulty: "Medium"
                        }
                    ]
                }
            ]
        }
    ];

    // Questions needed for these topics
    const questions: Question[] = [
        { id: "q_upsc_1", examId: "exam_upsc_cse", topicId: "topic_upsc_mod_hist", text: "Who was the first Governor General of India?", options: ["Lord Canning", "Lord Mountbatten", "Lord William Bentinck", "Robert Clive"], correctIndex: 2, explanation: "Lord William Bentinck was appointed as the first Governor General of India in 1833." },
        { id: "q_neet_1", examId: "exam_neet_ug", topicId: "topic_neet_cell", text: "Which organelle is known as the powerhouse of the cell?", options: ["Ribosome", "Mitochondria", "Nucleus", "Golgi Body"], correctIndex: 1, explanation: "Mitochondria produce ATP." },
        { id: "q_jee_1", examId: "exam_jee_adv", topicId: "topic_jee_calc", text: "Derivative of sin(x) is?", options: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"], correctIndex: 0, explanation: "d/dx(sin x) = cos x" },
        { id: "q_cat_1", examId: "exam_cat", topicId: "topic_cat_arith", text: "If 20% of x is 50, what is x?", options: ["200", "250", "100", "500"], correctIndex: 1, explanation: "0.20 * x = 50 => x = 250" },
        { id: "q_gate_1", examId: "exam_gate_cs", topicId: "topic_gate_proc", text: "What is a deadlock condition?", options: ["Mutual Exclusion", "No Preemption", "Hold and Wait", "All of the above"], correctIndex: 3, explanation: "All four conditions are required for deadlock." }
    ];

    // Write all data
    examsData.forEach(exam => {
        batch.set(doc(db, 'exams', exam.id), exam);
    });

    questions.forEach(q => {
        batch.set(doc(db, 'questions', q.id), q);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    return "Success";
};
