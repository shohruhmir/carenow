<script setup>
//calendar
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// format data pikker
const formatDate = date => {
	if (!date) return ''

	const parsedDate = new Date(date)
	if (isNaN(parsedDate)) return '' // Notog‘ri sana bo‘lsa, bo‘sh string qaytarish

	const formattedDate = new Intl.DateTimeFormat('uz-UZ', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false, // 24 soatlik format
	}).format(parsedDate)

	return formattedDate?.replace(/:\d{2}$/, ':00') // Minut qismiga har doim ":00" o‘rnatish
}

const disablePastDates = date => {
	const now = new Date()
	now.setHours(0, 0, 0, 0)
	return date < now
}
</script>
<template>
	<div class="">
		<div class="flex items-stretch gap-6">
			<!-- left -->
			<div class="p-5">
				<div class="w-full max-w-24 h-auto rounded-full overflow-hidden">
					<img src="~/assets/images/webp/doctor.webp" alt="doctor" />
				</div>
				<div class="mt-2 flex items-center justify-center gap-1">
					<UIcon
						name="material-symbols:star-outline-rounded"
						class="text-lg text-orange-500"
					/>
					<p class="text-gray-800">4.5</p>
				</div>
				<p class="text-xs text-gray-700 text-center">(76) отзывов</p>
			</div>
			<!-- left -->
			<!-- right -->
			<div class="flex-1 flex">
				<div class="p-5 pl-0 flex-1">
					<h3 class="font-semibold text-xl">Ли Ирина Николаевна</h3>
					<p class="text-sm text-gray-600 mt-3">
						Маммолог, Онкомаммолог, Детский маммолог, Детский онкомаммолог
					</p>
					<p class="text-xs text-gray-600 mt-3">
						Стаж 34 года / Врач высшей категории / Доктор медицинских наук
					</p>
					<div class="text-sm text-gray-600 mt-3">
						<p>Прием в клинике</p>
						<p class="text-main font-semibold mt-2">от 11 000 ₸</p>
					</div>
				</div>
			</div>
			<!-- right -->
		</div>

		<div>
			<!-- form -->
			<!-- date -->
			<UForm
				:schema="schema"
				:state="state"
				class="space-y-6"
				@submit="onSubmit"
			>
				<UFormField label="Telefo'n raqam" name="phone">
					<VueDatePicker
						placeholder="t('select')"
						:enable-minutes="false"
						:format="formatDate"
						:disabled-dates="disablePastDates"
						:is24="true"
						type="datetime"
						class="flex-1 text-gray-700 dark:text-gray-300 bg-transparent focus:outline-none"
					/>
				</UFormField>
				<UFormField label="Ism" name="name">
					<UInput
						size="lg"
						placeholder="p"
						variant="soft"
						type="text"
						class="font-inter text-black border border-gray-300 rounded-lg"
					/>
				</UFormField>
				<UFormField label="Familiya" name="phone">
					<UInput
						size="lg"
						placeholder="p"
						variant="soft"
						type="text"
						class="font-inter text-black border border-gray-300 rounded-lg"
					/>
				</UFormField>
				<UFormField label="Telefo'n raqam" name="phone">
					<UInput
						v-maska="'+998 ## ### ## ##'"
						size="lg"
						placeholder="p"
						variant="soft"
						type="text"
						class="font-inter text-black border border-gray-300 rounded-lg"
					/>
				</UFormField>

				<div class="flex justify-end">
					<BaseButton text="Saqlash" />
				</div>
			</UForm>
		</div>
	</div>
</template>
