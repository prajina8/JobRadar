
export async function fetchDemoJobs() {
  return [
    {
      externalId: "demo-react-001",
      source: "DemoFeed",
      title: "Frontend Developer",
      company: "Demo Technologies",
      description: "Build modern web applications using React and JavaScript.",
      requirements: ["Strong JavaScript fundamentals", "React experience"],
      skills: ["React", "JavaScript", "CSS", "Git"],
      location: "Kathmandu",
      jobType: "Full-time",
      workMode: "Hybrid",
      experienceLevel: "Entry level",
      sourceUrl: "https://example.com/jobs/demo-react-001",
      postedDate: new Date()
    },
    {
      externalId: "demo-qa-001",
      source: "DemoFeed",
      title: "QA Engineer Intern",
      company: "Demo Labs",
      description: "Test web applications and work with developers to improve quality.",
      requirements: ["Testing fundamentals", "Attention to detail"],
      skills: ["Testing", "Postman", "JavaScript", "Git"],
      location: "Remote",
      jobType: "Internship",
      workMode: "Remote",
      experienceLevel: "Internship",
      sourceUrl: "https://example.com/jobs/demo-qa-001",
      postedDate: new Date()
    }
  ];
}
