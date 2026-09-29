export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } })
  }
})
