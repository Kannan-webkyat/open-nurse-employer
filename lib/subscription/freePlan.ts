export const FREE_PLAN_NAME = "Free Plan"

export const FREE_PLAN = {
    id: 0,
    name: FREE_PLAN_NAME,
    amount: 0,
    type: 0,
    nurse_slots: 1,
    unlimited_job_postings: false,
    short_description:
        "A simple, low-cost way for healthcare employers to advertise vacancies on Open Nurses®️.",
    inclusions: [
        "Post 1 Healthcare Job Advert",
        "Advert Live for 15 Days",
        "Employer Dashboard Access",
        "Receive Candidate Applications",
        "Email Application Notifications",
        "Basic Applicant Management",
        "Edit or Close Job Advert Anytime",
        "Job Advert Reviewed Before Publishing",
        "Basic Employer Support",
    ],
} as const
