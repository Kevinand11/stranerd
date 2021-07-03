import { BaseEntity } from '@modules/core/domains/entities/base'
import { capitalize } from '@utils/commons'
import { Avatars } from './avatar'
import { getScore, getDefaultRank } from './ranks'

export class UserEntity extends BaseEntity {
	public readonly id: string
	public readonly roles: Required<UserRoles>
	public readonly bio: Required<UserBio>
	public readonly account: Omit<UserAccount, 'meta'> & { meta: Record<keyof UserAccount['meta'], string[]> }
	public readonly status: Required<UserStatus>
	public readonly tutor: Required<UserTutor>
	public readonly dates: UserDates

	constructor ({ id, bio, roles, account, status, tutor, dates }: UserConstructorArgs) {
		super()
		this.id = id
		this.bio = generateDefaultBio(bio)
		this.roles = {
			isAdmin: roles?.isAdmin ?? false
		}
		this.account = {
			rank: account?.rank ?? getDefaultRank(),
			coins: {
				bronze: account?.coins?.bronze ?? 0,
				gold: account?.coins?.gold ?? 0
			},
			bought: {
				bronze: account?.bought?.bronze ?? 0,
				gold: account?.bought?.gold ?? 0
			},
			currentSession: account?.currentSession ?? null,
			meta: {
				answers: Object.keys(account?.meta?.answers ?? {}),
				bestAnswers: Object.keys(account?.meta?.bestAnswers ?? {}),
				ratedAnswers: Object.keys(account?.meta?.ratedAnswers ?? {}),
				questions: Object.keys(account?.meta?.questions ?? {}),
				bestAnsweredQuestions: Object.keys(account?.meta?.bestAnsweredQuestions ?? {}),
				answeredQuestions: Object.keys(account?.meta?.answeredQuestions ?? {}),
				questionComments: Object.keys(account?.meta?.questionComments ?? {}),
				answerComments: Object.keys(account?.meta?.answerComments ?? {}),
				sessions: Object.keys(account?.meta?.sessions ?? {}),
				completedSessions: Object.keys(account?.meta?.completedSessions ?? {}),
				tutorSessions: Object.keys(account?.meta?.tutorSessions ?? {})
			},
			streak: {
				count: account?.streak?.count ?? 0,
				longestStreak: account?.streak?.longestStreak ?? 0,
				lastSeen: account?.streak?.lastSeen ?? 0
			},
			ratings: {
				total: account?.ratings?.total ?? 0,
				count: account?.ratings?.count ?? 0,
				average: account?.ratings?.average ?? 0
			}
		}
		this.status = {
			connections: status?.connections ?? {},
			lastSeen: status?.lastSeen ?? 0
		}
		this.tutor = {
			subject: tutor?.subject ?? undefined,
			currentSession: tutor?.currentSession ?? null
		}
		this.dates = {
			signedUpAt: dates?.signedUpAt ?? 0,
			deletedAt: dates?.deletedAt ?? undefined
		}
	}

	get firstName () { return this.bio.name.first }
	get lastName () { return this.bio.name.last }
	get fullName () { return this.bio.name.fullName! }
	get email () { return this.bio.email }
	get avatar () { return this.bio.avatar! }

	get isOnline () { return Object.keys(this.status.connections).length > 0 }
	get lastSeen () { return this.isOnline ? Date.now() : this.status.lastSeen }

	get averageRating () { return this.account.ratings.average }
	get ratingCount () { return this.account.ratings.count }
	get orderRating () { return Math.pow(this.account.ratings.total, this.averageRating) }
	get currentSession () { return this.account.currentSession || this.tutor.currentSession || null }
	get subject () { return this.tutor.subject ?? null }
	get score () { return getScore(this) }
}

type UserConstructorArgs = {
	id: string
	bio: UserBio
	roles: UserRoles
	account: UserAccount
	status?: UserStatus
	tutor?: UserTutor
	dates: UserDates
}

export interface UserBio {
	name: {
		first: string
		last: string
		fullName?: string
	}
	email: string
	description: string
	avatar: keyof typeof Avatars | null
	isNew?: boolean | null
}
export interface UserRoles {
	isAdmin?: boolean
}
export interface UserAccount {
	rank: string
	coins: {
		bronze: number
		gold: number
	},
	bought: {
		bronze: number
		gold: number
	},
	currentSession: string | null
	meta: {
		answers?: Record<string, boolean>
		bestAnswers?: Record<string, boolean>
		ratedAnswers?: Record<string, boolean>
		answeredQuestions?: Record<string, boolean>
		questions?: Record<string, boolean>
		bestAnsweredQuestions?: Record<string, boolean>
		questionComments?: Record<string, boolean>
		answerComments?: Record<string, boolean>
		sessions?: Record<string, boolean>
		completedSessions?: Record<string, boolean>
		tutorSessions?: Record<string, boolean>
	}
	streak: {
		count: number,
		longestStreak: number,
		lastSeen: number
	}
	ratings: {
		total: number
		count: number
		average: number
	}
}
export interface UserStatus {
	connections: Record<string, boolean>
	lastSeen: number
}
export interface UserDates {
	signedUpAt: number
	deletedAt?: number
}
export interface UserTutor {
	subject: {
		id: string
		level: number
		upgrades: Record<number, {
			score: number
			takenAt: number
			passed: boolean
		}>
	} | undefined
	currentSession?: string | null
}

export const generateDefaultBio = (bio: Partial<UserBio>) :Required<UserBio> => {
	const first = capitalize(bio?.name?.first ?? 'Anon')
	const last = capitalize(bio?.name?.last ?? 'Ymous')
	const fullName = first + ' ' + last
	const email = bio?.email ?? 'anon@ymous.com'
	const description = bio?.description ?? ''
	const avatar = Avatars[bio?.avatar!] ? bio?.avatar! : Avatars.default.id
	const isNew = !!bio.isNew ?? false
	return { name: { first, last, fullName }, email, description, avatar, isNew }
}
