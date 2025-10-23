import { Conversations } from "../types"

const generateDate = (daysAgo: number, hoursOffset: number = 0, minutesOffset: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursOffset)
  date.setMinutes(date.getMinutes() - minutesOffset)
  return date.toISOString()
}
export const MOCK_CONVERSATIONS: Conversations = {
  items: [
    {
      id: "68e101a2-7e44-8321-9d25-9a1dfe213001",
      title: "Advances in Cancer Immunotherapy",
      create_time: generateDate(0, 2, 15), // Today, 2h 15m ago
      update_time: generateDate(0, 1, 30), // Today, 1h 30m ago
    },
    {
      id: "68e102b3-9f55-8324-a621-1b8dfc214002",
      title: "AI Applications in Radiology",
      create_time: generateDate(1, 3, 0), // Yesterday
      update_time: generateDate(1, 2, 15),
    },
    {
      id: "68e103c4-af66-8325-8d31-2c9dfc215003",
      title: "Clinical Trials Management Systems",
      create_time: generateDate(2, 5, 0), // 2 days ago
      update_time: generateDate(2, 4, 0),
    },
    {
      id: "68e104d5-b077-8322-b942-3d0dfc216004",
      title: "Genetic Markers in Rare Diseases",
      create_time: generateDate(3, 1, 30), // 3 days ago
      update_time: generateDate(3, 0, 45),
    },
    {
      id: "68e105e6-c188-8323-9a53-4e1dfc217005",
      title: "Telemedicine for Rural Communities",
      create_time: generateDate(5, 6, 0), // 5 days ago
      update_time: generateDate(5, 4, 30),
    },
    {
      id: "68e106f7-d299-8324-aa64-5f2dfc218006",
      title: "Nutrition and Preventive Medicine",
      create_time: generateDate(7, 2, 0), // 1 week ago
      update_time: generateDate(7, 1, 0),
    },
    {
      id: "68e10708-e3aa-8325-ab75-6a3dfc219007",
      title: "AI in Personalized Treatment Plans",
      create_time: generateDate(10, 4, 0), // 10 days ago
      update_time: generateDate(10, 3, 0),
    },
    {
      id: "68e10819-f4bb-8326-bc86-7b4dfc220008",
      title: "Managing Chronic Pain Effectively",
      create_time: generateDate(12, 1, 0), // 12 days ago
      update_time: generateDate(12, 0, 30),
    },
    {
      id: "68e1092a-05cc-8327-ad97-8c5dfc221009",
      title: "Pediatric Vaccination Guidelines",
      create_time: generateDate(15, 3, 0), // 15 days ago
      update_time: generateDate(15, 2, 0),
    },
    {
      id: "68e10a3b-16dd-8328-aea8-9d6dfc222010",
      title: "Mental Health in Adolescents",
      create_time: generateDate(18, 5, 0), // 18 days ago
      update_time: generateDate(18, 4, 0),
    },
    {
      id: "68e10b4c-27ee-8329-afb9-0e7dfc223011",
      title: "Surgical Robotics Innovations",
      create_time: generateDate(21, 2, 0), // 3 weeks ago
      update_time: generateDate(21, 1, 0),
    },
    {
      id: "68e10c5d-38ff-8330-b0ca-1f8dfc224012",
      title: "AI for Drug Discovery",
      create_time: generateDate(25, 6, 0), // 25 days ago
      update_time: generateDate(25, 5, 0),
    },
    {
      id: "68e10d6e-4900-8331-b1db-209dfc225013",
      title: "Emergency Medicine Protocols",
      create_time: generateDate(28, 3, 0), // 4 weeks ago
      update_time: generateDate(28, 2, 0),
    },
    {
      id: "68e10e7f-5a11-8332-b2ec-31adfc226014",
      title: "Sleep Disorders and Treatments",
      create_time: generateDate(32, 1, 0), // ~1 month ago
      update_time: generateDate(32, 0, 30),
    },
    {
      id: "68e10f80-6b22-8333-b3fd-42befc227015",
      title: "AI in Epidemiology Tracking",
      create_time: generateDate(35, 4, 0),
      update_time: generateDate(35, 3, 0),
    },
    {
      id: "68e11091-7c33-8334-b50e-53cefc228016",
      title: "Digital Health Records Security",
      create_time: generateDate(40, 2, 0),
      update_time: generateDate(40, 1, 0),
    },
    {
      id: "68e111a2-8d44-8335-b61f-64defc229017",
      title: "Ethics in Medical AI",
      create_time: generateDate(45, 5, 0), // 1.5 months ago
      update_time: generateDate(45, 4, 0),
    },
    {
      id: "68e112b3-9e55-8336-b72a-75efc230018",
      title: "Pharmacology of Antibiotics",
      create_time: generateDate(50, 3, 0),
      update_time: generateDate(50, 2, 0),
    },
    {
      id: "68e113c4-af66-8337-b83b-86ffc231019",
      title: "Preventive Cardiology Practices",
      create_time: generateDate(55, 1, 0),
      update_time: generateDate(55, 0, 30),
    },
    {
      id: "68e114d5-b077-8338-b94c-97gfc232020",
      title: "AI in Medical Image Segmentation",
      create_time: generateDate(60, 6, 0), // 2 months ago
      update_time: generateDate(60, 5, 0),
    },
    {
      id: "68dd416a-e994-8331-ac12-892dde239481",
      title: "Medical Research Database Tools",
      create_time: generateDate(65, 2, 0),
      update_time: generateDate(65, 1, 30),
    },
    {
      id: "68da9cf6-b43c-8325-89ea-94280fa747e0",
      title: "Coping with Toxic People and Mental Health",
      create_time: generateDate(70, 4, 0),
      update_time: generateDate(70, 3, 0),
    },
    {
      id: "68da64bb-db10-8333-a69d-67c59e90c112",
      title: "Correcting Medical Record Errors",
      create_time: generateDate(75, 1, 0),
      update_time: generateDate(75, 0, 45),
    },
    {
      id: "68d962ee-bb0c-8333-9199-674cccff1bc6",
      title: "Clinical Assessment Questionnaires",
      create_time: generateDate(80, 3, 0),
      update_time: generateDate(80, 2, 0),
    },
    {
      id: "68d943ac-6f88-8330-bc98-67e851c4066e",
      title: "Improving Diagnostic Protocols",
      create_time: generateDate(85, 5, 0),
      update_time: generateDate(85, 4, 0),
    },
    {
      id: "68d948a5-c004-8324-846e-3cbdcdeb651f",
      title: "Psychological Manipulation in Patient Care",
      create_time: generateDate(90, 2, 0), // 3 months ago
      update_time: generateDate(90, 1, 0),
    },
    {
      id: "6872689e-2010-8001-b566-d87dba2546b3",
      title: "Medical AI for Treatment Planning",
      create_time: generateDate(100, 6, 0),
      update_time: generateDate(100, 5, 0),
    },
    {
      id: "68d6639b-db20-8322-8747-8057c1cba614",
      title: "Handling Patient Health Status",
      create_time: generateDate(110, 3, 0),
      update_time: generateDate(110, 2, 0),
    },
    {
      id: "68d5237c-67a0-8324-b8f2-a34404c8d3f8",
      title: "Improving Medical Imaging Contrast",
      create_time: generateDate(120, 1, 0), // 4 months ago
      update_time: generateDate(120, 0, 30),
    },
    {
      id: "6885bf43-4400-8001-99d9-13a2734e9de5",
      title: "Public Health Education Campaigns",
      create_time: generateDate(135, 4, 0),
      update_time: generateDate(135, 3, 0),
    },
    {
      id: "68d437cc-d590-8324-9acc-75bc1c689210",
      title: "Correcting Prescription Errors",
      create_time: generateDate(150, 2, 0), // 5 months ago
      update_time: generateDate(150, 1, 0),
    },
    {
      id: "68d4287e-17cc-832c-9a9e-2dc576fdccaa",
      title: "Balancing Dosage Levels",
      create_time: generateDate(165, 5, 0),
      update_time: generateDate(165, 4, 0),
    },
    {
      id: "68d12329-ab60-832e-8ade-bad858699f86",
      title: "Fixing Diagnostic Test Protocols",
      create_time: generateDate(180, 3, 0), // 6 months ago
      update_time: generateDate(180, 2, 0),
    },
    {
      id: "68d383de-c260-8327-8520-1c4be01c50aa",
      title: "Patient Recovery Stages",
      create_time: generateDate(200, 1, 0),
      update_time: generateDate(200, 0, 45),
    },
    {
      id: "68d2afcf-2044-8323-89b6-f16cce9cf4e4",
      title: "Generate Sample Clinical Data",
      create_time: generateDate(220, 6, 0),
      update_time: generateDate(220, 5, 0),
    },
    {
      id: "68d2516d-87e4-832e-ac86-f063b7915d9f",
      title: "Medical Symbol Encoding",
      create_time: generateDate(240, 4, 0), // 8 months ago
      update_time: generateDate(240, 3, 0),
    },
    {
      id: "68d232ff-b430-832b-8f48-fb7f92b21400",
      title: "Central Role of the Brain in Health",
      create_time: generateDate(260, 2, 0),
      update_time: generateDate(260, 1, 0),
    },
    {
      id: "68d012f2-6064-8320-a9f6-5e0821f84683",
      title: "Simulated Medical Reports",
      create_time: generateDate(280, 5, 0),
      update_time: generateDate(280, 4, 0),
    },
    {
      id: "68cfa7bb-7754-8330-8c65-7b47b919cc51",
      title: "Top Medical Devices 2025",
      create_time: generateDate(300, 3, 0), // 10 months ago
      update_time: generateDate(300, 2, 0),
    },
    {
      id: "68cebb2d-5464-8330-a76b-a616ccc4393a",
      title: "Refining Medical Reports",
      create_time: generateDate(320, 1, 0),
      update_time: generateDate(320, 0, 30),
    },
    {
      id: "68ceab79-5b44-8321-95a4-85a81a9d0a4d",
      title: "Voice Recognition for Healthcare",
      create_time: generateDate(340, 6, 0),
      update_time: generateDate(340, 5, 0),
    },
    {
      id: "68cd61af-1828-8323-bf4e-ddc2dcbd3b2c",
      title: "Medical Imaging Display Systems",
      create_time: generateDate(355, 4, 0), // ~1 year ago
      update_time: generateDate(355, 3, 0),
    },
    {
      id: "68ccea09-8634-832a-9b8d-f0425fea6e93",
      title: "Adjusting Patient Count Records",
      create_time: generateDate(365, 2, 0), // 1 year ago
      update_time: generateDate(365, 1, 0),
    },
    {
      id: "68c99267-2044-8331-9369-1e6f07d12043",
      title: "Phases of Medical Treatment",
      create_time: generateDate(370, 5, 0),
      update_time: generateDate(370, 4, 0),
    },
    {
      id: "68cbc51e-2c80-832c-b1bc-050f1aa3e2ab",
      title: "Pharmaceutical Supply Chain Tracking",
      create_time: generateDate(380, 3, 0),
      update_time: generateDate(380, 2, 0),
    },
    {
      id: "68cab7a5-e19c-832d-96f5-e5a5ddc4039c",
      title: "Medical Equipment Components",
      create_time: generateDate(390, 1, 0),
      update_time: generateDate(390, 0, 45),
    },
    {
      id: "68ca6566-e5f8-8325-872f-e471a82ae2a9",
      title: "Updating Patient Records Remotely",
      create_time: generateDate(400, 6, 0),
      update_time: generateDate(400, 5, 0),
    },
    {
      id: "68bea702-7e40-8320-ae6f-cb525b6ed841",
      title: "Color Contrast in Medical Charts",
      create_time: generateDate(410, 4, 0),
      update_time: generateDate(410, 3, 0),
    },
    {
      id: "68e115e6-c188-8339-b95d-a8hfc233021",
      title: "Wearable Devices for Health Monitoring",
      create_time: generateDate(0, 5, 0), // Today
      update_time: generateDate(0, 4, 0),
    },
    {
      id: "68e116f7-d299-8340-ba6e-b9ifc234022",
      title: "AI-Powered Mental Health Chatbots",
      create_time: generateDate(4, 2, 0),
      update_time: generateDate(4, 1, 0),
    },
    {
      id: "68e11708-e3aa-8341-bb7f-cajfc235023",
      title: "Blockchain in Healthcare Data Sharing",
      create_time: generateDate(8, 3, 0),
      update_time: generateDate(8, 2, 0),
    },
    {
      id: "68e11819-f4bb-8342-bc90-dbkgfc236024",
      title: "AI for Early Cancer Detection",
      create_time: generateDate(14, 1, 0), // 2 weeks ago
      update_time: generateDate(14, 0, 30),
    },
    {
      id: "68e1192a-05cc-8343-bda1-eclgfc237025",
      title: "3D Printing in Prosthetics",
      create_time: generateDate(20, 4, 0),
      update_time: generateDate(20, 3, 0),
    },
    {
      id: "68e11a3b-16dd-8344-bea2-fdmhfc238026",
      title: "AI in Predictive Healthcare Analytics",
      create_time: generateDate(27, 2, 0),
      update_time: generateDate(27, 1, 0),
    },
    {
      id: "68e11b4c-27ee-8345-bfb3-genifc239027",
      title: "Mobile Apps for Patient Engagement",
      create_time: generateDate(33, 5, 0), // ~1 month ago
      update_time: generateDate(33, 4, 0),
    },
    {
      id: "68e11c5d-38ff-8346-c0c4-hfojfc240028",
      title: "Genomics and Personalized Medicine",
      create_time: generateDate(38, 3, 0),
      update_time: generateDate(38, 2, 0),
    },
    {
      id: "68e11d6e-4900-8347-c1d5-ifpkfc241029",
      title: "AI in Surgical Outcome Predictions",
      create_time: generateDate(43, 1, 0),
      update_time: generateDate(43, 0, 45),
    },
    {
      id: "68e11e7f-5a11-8348-c2e6-jgqlfc242030",
      title: "Telehealth for Elderly Patients",
      create_time: generateDate(48, 6, 0),
      update_time: generateDate(48, 5, 0),
    },
    {
      id: "68e11f80-6b22-8349-c3f7-khrmfc243031",
      title: "Wearables in Sports Medicine",
      create_time: generateDate(53, 4, 0),
      update_time: generateDate(53, 3, 0),
    },
    {
      id: "68e12091-7c33-8350-c408-lisnfc244032",
      title: "AI for Rare Disease Diagnosis",
      create_time: generateDate(58, 2, 0),
      update_time: generateDate(58, 1, 0),
    },
    {
      id: "68e121a2-8d44-8351-c519-mjsofc245033",
      title: "Healthcare IoT Security Challenges",
      create_time: generateDate(63, 5, 0), // ~2 months ago
      update_time: generateDate(63, 4, 0),
    },
    {
      id: "68e122b3-9e55-8352-c62a-nktpfc246034",
      title: "Nanomedicine for Drug Delivery",
      create_time: generateDate(68, 3, 0),
      update_time: generateDate(68, 2, 0),
    },
    {
      id: "68e123c4-af66-8353-c73b-oluqfc247035",
      title: "AI in Clinical Decision Support",
      create_time: generateDate(73, 1, 0),
      update_time: generateDate(73, 0, 30),
    },
    {
      id: "68e124d5-b077-8354-c84c-pmvrfc248036",
      title: "Digital Twins in Healthcare",
      create_time: generateDate(78, 6, 0),
      update_time: generateDate(78, 5, 0),
    },
    {
      id: "68e125e6-c188-8355-c95d-qnwsfc249037",
      title: "AI-Driven Drug Repurposing",
      create_time: generateDate(83, 4, 0),
      update_time: generateDate(83, 3, 0),
    },
    {
      id: "68e126f7-d299-8356-ca6e-roxtfc250038",
      title: "Voice Assistants in Patient Care",
      create_time: generateDate(88, 2, 0), // ~3 months ago
      update_time: generateDate(88, 1, 0),
    },
    {
      id: "68e12708-e3aa-8357-cb7f-spyufc251039",
      title: "AI in Pathology Image Analysis",
      create_time: generateDate(93, 5, 0),
      update_time: generateDate(93, 4, 0),
    },
    {
      id: "68e12819-f4bb-8358-cc90-tqzvfc252040",
      title: "Robotics in Rehabilitation Therapy",
      create_time: generateDate(98, 3, 0),
      update_time: generateDate(98, 2, 0),
    },
    {
      id: "68e1292a-05cc-8359-cda1-urawfc253041",
      title: "AI in Population Health Management",
      create_time: generateDate(105, 1, 0),
      update_time: generateDate(105, 0, 45),
    },
    {
      id: "68e12a3b-16dd-8360-cea2-vsbxfc254042",
      title: "Bioprinting in Regenerative Medicine",
      create_time: generateDate(115, 6, 0),
      update_time: generateDate(115, 5, 0),
    },
    {
      id: "68e12b4c-27ee-8361-cfb3-wtcyfc255043",
      title: "Remote Patient Monitoring Systems",
      create_time: generateDate(125, 4, 0), // ~4 months ago
      update_time: generateDate(125, 3, 0),
    },
    {
      id: "68e12c5d-38ff-8362-cgc4-xudzfc256044",
      title: "AI for Medical Risk Assessment",
      create_time: generateDate(140, 2, 0),
      update_time: generateDate(140, 1, 0),
    },
    {
      id: "68e12d6e-4900-8363-chd5-yveafc257045",
      title: "Virtual Reality in Medical Training",
      create_time: generateDate(155, 5, 0), // ~5 months ago
      update_time: generateDate(155, 4, 0),
    },
    {
      id: "68e12e7f-5a11-8364-cie6-zwfbfc258046",
      title: "AI for Pandemic Response",
      create_time: generateDate(170, 3, 0),
      update_time: generateDate(170, 2, 0),
    },
    {
      id: "68e12f80-6b22-8365-cjf7-axgcfc259047",
      title: "Augmented Reality in Surgery",
      create_time: generateDate(185, 1, 0), // ~6 months ago
      update_time: generateDate(185, 0, 30),
    },
    {
      id: "68e13091-7c33-8366-ck08-bydhfc260048",
      title: "AI in Clinical Workflow Optimization",
      create_time: generateDate(210, 6, 0), // ~7 months ago
      update_time: generateDate(210, 5, 0),
    },
    {
      id: "68e131a2-8d44-8367-cl19-czefc261049",
      title: "Precision Oncology Advances",
      create_time: generateDate(230, 4, 0),
      update_time: generateDate(230, 3, 0),
    },
    {
      id: "68e132b3-9e55-8368-cm2a-dafifc262050",
      title: "AI in Health Insurance Fraud Detection",
      create_time: generateDate(250, 2, 0), // ~8 months ago
      update_time: generateDate(250, 1, 0),
    },
    {
      id: "68e133c4-af66-8369-cn3b-ebgjfc263051",
      title: "Remote Diagnostics with AI",
      create_time: generateDate(270, 5, 0), // ~9 months ago
      update_time: generateDate(270, 4, 0),
    },
    {
      id: "68e134d5-b077-8370-co4c-fchjfc264052",
      title: "Neurotechnology in Cognitive Therapy",
      create_time: generateDate(290, 3, 0),
      update_time: generateDate(290, 2, 0),
    },
    {
      id: "68e135e6-c188-8371-cp5d-gdkkfc265053",
      title: "AI in Intensive Care Monitoring",
      create_time: generateDate(310, 1, 0), // ~10 months ago
      update_time: generateDate(310, 0, 45),
    },
  ],
}
