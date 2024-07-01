import { GraphQLError } from 'graphql'
import { getCompany } from './db/companies.js'
import { createJob, deleteJob, getJob, getJobByCompany, getJobs, updateJob } from './db/jobs.js'

export const resolvers = {
    Query: {
        company: async (_root, { id }) => {
            const company = await getCompany(id)
            if (!company) {
                throw notFoundError('No company found with id ' + id)
            }
            return company
        },
        job: async (_root, { id }) => {
            const job = await getJob(id)
            if (!job) {
                throw notFoundError('No job found with id ' + id)
            }
            return job

        },
        jobs: () => getJobs()
    },

    Mutation: {
        createJob: (_root, { input: { title, description } }, { user }) => {
            if (!user) {
                throw unAuthorizedError('Missing authentication')
            }
            return createJob({ companyId: user.companyId, title, description })
        },
        deleteJob: async (_root, { id }, {user}) => {
            if (!user) {
                throw unAuthorizedError('Missing authentication')
            }
            const job = await deleteJob(id)
            if(!job){
                throw notFoundError('No job found with id ' + id)
            }
            return job
        },
        updateJob: async(_root, { input: { id, title, description } }, {user}) => {
            if (!user) {
                throw unAuthorizedError('Missing authentication')
            }
            const job = await  updateJob({ id,companyId:user.companyId, title, description })
            if(!job){
                throw notFoundError('No job found with id ' + id)
            }
            return job
           
           
        },
    },
    Company: {
        jobs: (company) => getJobByCompany(company.id)
    },
    Job: {
        company: (job) => getCompany(job.companyId),
        date: (job) => toIsoDate(job.createdAt)
    }
}
function notFoundError(message) {
    return new GraphQLError(message, {
        extensions: { code: 'NOT_FOUND' },
    })
}
function unAuthorizedError(message) {
    return new GraphQLError(message, {
        extensions: { code: 'UNAUTHORIZED' },
    })
}

function toIsoDate(value) {
    return value.slice(0, 'yyyy-mm-dd'.length)
}
