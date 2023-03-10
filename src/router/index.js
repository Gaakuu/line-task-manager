import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/components/MainView.vue'
import GroupView from '@/components/GroupView.vue'
import TaskView from '@/components/TaskView.vue'
import AddGroup from '@/components/AddGroup.vue'
import AddTask from '@/components/AddTask.vue'
import Register from '@/components/Register.vue'
import EditTask from '@/components/EditTask.vue'
import Invite from '@/components/Invite.vue'
import Invited from '@/components/InvitedView.vue'
import DetailView from '@/components/DetailView.vue'
import NotAllowed from '@/components/NotAllowed.vue'
import UserInfo from '@/components/UserInfo.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/:gid',
    name: 'groupView',
    component: GroupView
  },
  {
    path: '/:gid/:tid',
    name: 'taskView',
    component: TaskView
  },
  {
    path: '/addgroup',
    name: 'addGroup',
    component: AddGroup
  },
  {
    path: '/:gid/addTask',
    name: 'addTask',
    component: AddTask
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/:gid/:tid/edit',
    name: 'editTask',
    component:EditTask
  },
  {
    path:'/:gid/invite',
    name:'invite',
    component:Invite
  },
  {
    path:'/:gid/invited/:code',
    name:'invited',
    component:Invited
  },
  {
    path:'/:gid/detail',
    name:'groupDetail',
    component:DetailView
  },
  {
    path:'/oops',
    name:"notAllowed",
    component:NotAllowed
  },
  {
    path:'/user',
    name:'userInfo',
    component: UserInfo
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router