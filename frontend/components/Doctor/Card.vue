<script lang="ts" setup>
//===============================-< add patient >-===============================
//> variables
const isOpenAddPatient = ref(false)
const openAddPatient = () => {
	isOpenAddPatient.value = true
}
const closeAddPatient = () => {
	isOpenAddPatient.value = false
}
//> functions
function submitAddPatient() {
	closeAddPatient()
}
</script>
<template>
	<article>
		<div class="flex items-stretch gap-10 shadow-modal rounded-xl bg-white">
			<!-- left -->
			<div class="p-5">
				<div class="w-full max-w-32 h-auto rounded-full overflow-hidden">
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

					<div class="mt-6">
						<h4>Via Medical</h4>
						<p class="text-sm text-gray-600 mt-2">
							ул. Розыбакиева, 218а (выше Тимирязева), Алматы
						</p>
						<p class="text-sm text-gray-600 mt-1">Сайран (1,9 км)</p>
					</div>
					<div class="mt-4 flex items-start gap-2">
						<UIcon
							name="material-symbols:map-outline-rounded"
							class="text-xl w-6 h-6 shrink-0"
						/>
						<NuxtLink
							to="/"
							class="font-inter text-sm text-gray-700 hover:text-main transition-colors underline"
						>
							Xaritada ko'rish
						</NuxtLink>
					</div>
				</div>

				<div class="p-5 border-l border-l-gray-300">
					<div class="flex items-start justify-between gap-2">
						<button
							class="flex items-center justify-center rounded-full bg-main w-8 h-8"
						>
							<UIcon
								name="iconamoon:arrow-left-2-light"
								class="text-2xl text-white"
							/>
						</button>
						<div class="flex flex-col gap-2">
							<div class="text-gray-600 text-xs text-center">
								<p>сегодня</p>
								<p>9 июн.</p>
							</div>
							<button
								v-for="item in 5"
								:key="item"
								class="bg-main px-2 py-1.5 rounded-md text-xs text-white hover:bg-main-hover transition-colors"
							>
								15:30
							</button>
						</div>
						<div class="flex flex-col gap-2">
							<div class="text-gray-600 text-xs text-center">
								<p>сегодня</p>
								<p>9 июн.</p>
							</div>
							<button
								v-for="item in 6"
								:key="item"
								class="bg-main px-2 py-1.5 rounded-md text-xs text-white hover:bg-main-hover transition-colors"
							>
								15:30
							</button>
						</div>
						<div class="flex flex-col gap-2">
							<div class="text-gray-600 text-xs text-center">
								<p>сегодня</p>
								<p>9 июн.</p>
							</div>
							<button
								v-for="item in 5"
								:key="item"
								class="bg-main px-2 py-1.5 rounded-md text-xs text-white hover:bg-main-hover transition-colors"
							>
								15:30
							</button>
						</div>
						<div class="flex flex-col gap-2">
							<div class="text-gray-600 text-xs text-center">
								<p>сегодня</p>
								<p>9 июн.</p>
							</div>
							<button
								v-for="item in 3"
								:key="item"
								class="bg-main px-2 py-1.5 rounded-md text-xs text-white hover:bg-main-hover transition-colors"
								@click="openAddPatient"
							>
								15:30
							</button>
						</div>

						<button
							class="flex items-center justify-center rounded-full bg-main w-8 h-8"
						>
							<UIcon
								name="iconamoon:arrow-right-2-light"
								class="text-2xl text-white"
							/>
						</button>
					</div>
				</div>
			</div>
			<!-- right -->
		</div>
		<!--=== modals ===-->
		<!-- send phone number -->
		<BaseModal :is-open="isOpenAddPatient" @close="closeAddPatient">
			<template #header>
				<div class="">
					<h5 class="font-semibold text-lg">Записаться онлайн</h5>
				</div>
			</template>
			<DoctorAddPatient @submit="submitAddPatient" />
		</BaseModal>
		<!--=== modals ===-->
	</article>
</template>
