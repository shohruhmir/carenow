import Service from '~/service/Service'

export interface CreateLeadInput {
	clinicName: string
	city: string
	branchCount: string
	phone: string
}

export function useBusinessApi() {
	const { locale } = useI18n()

	async function createLead(input: CreateLeadInput) {
		return Service.post<{ id: string }, CreateLeadInput>('/business/leads', locale.value, input)
	}

	return { createLead }
}
