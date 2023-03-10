import { createStore } from "vuex";
import { useRouter } from 'vue-router'
import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	arrayUnion,
	Timestamp,
} from "firebase/firestore";
import liff from "@line/liff"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCi7yhXnAjx2RjTCZfSRyDIeri0R-jFVJA",
	authDomain: "line-task-manager-76828.firebaseapp.com",
	projectId: "line-task-manager-76828",
	storageBucket: "line-task-manager-76828.appspot.com",
	messagingSenderId: "477104017559",
	appId: "1:477104017559:web:9c12b8a9323438815819d2",
	measurementId: "G-HL2XJF7L93",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const store = createStore({
	state: {
		userID: null,
		pageNum: 0,
		mounted: false,
		dataLoadedStatus: {names:false, groupInfo:false, taskInfo:false},
		userInfo: {},
		myGroups: [],
		groupInfo: {},
		myTasks: [],
		taskInfo: {},
		nameList: {},
		sortModeHolder:0,
		snackbar:{show:false, text:""},
		appbarTitle:"",
	},
	getters: {
		userID: (state) => state.userID,
		userInfo: (state) => state.userInfo,
		myGroups: (state) => state.myGroups,
		groupInfo: (state) => state.groupInfo,
		myTasks: (state) => state.myTasks,
		taskInfo: (state) => state.taskInfo,
		nameList: (state) => state.nameList,
		mounted: (state) => state.mounted,
		pageNum:(state)=>state.pageNum,
		dataLoadedStatus:(state)=>state.dataLoadedStatus,
		sortModeHolder:(state)=>state.sortModeHolder,
		snackbar:(state)=>state.snackbar,
		appbarTitle:(state)=>state.appbarTitle
	},
	mutations: {
		changeMount(state, bool) {
			state.mounted = bool;
		},
		changeDataLoadedStatus(state, data){
			state.dataLoadedStatus[data.cat] = data.bool;
		},
		setPageNum(state, n) {
			state.pageNum = n;
		},
		setUserID(state, uid) {
			state.userID = uid;
		},
		setUserInfo(state, info) {
			state.userInfo = info;
		},
		setAppbarTitle(state, title){
			state.appbarTitle = title;
		},
		addGroup(state, gid){
			state.userInfo.groups.push(gid)
		},
		setMyGroups(state, groups) {
			state.myGroups = groups;
		},
		setGroupInfo(state, info) {
			if(info.log){
				info.log = info.log.reverse();
			}
			state.groupInfo = info;
		},
		setMyTasks(state, tasks) {
			const done = tasks.filter(t=>{return t.status==2})
			const doing = tasks.filter(t=>{return t.status!=2})
			state.myTasks = [doing, done];
			console.log(state.myTasks[1])
		},
		setTaskInfo(state, info) {
			state.taskInfo = info;
		},
		addUserName(state, data) {
			state.nameList[data.uid] = data.name;
		},
		setProgress(state, progress) {
			state.taskInfo.progress = progress;
		},
		mergeTaskInfo(state, data) {
			state.taskInfo = {...state.taskInfo, ...data}
		},
		addComment(state, data){
			state.taskInfo.comments.unshift(data)
		},
		sortTasks(state, mode){
			switch(mode){
				case 0:
					state.myTasks.forEach(t => t = t.sort((a, b)=> {
						return a.priority > b.priority? -1:1;
					}))
					break;
				case 1:
					state.myTasks.forEach(t => t = t.sort((a, b)=> {
						return a.priority < b.priority? -1:1;
					}))
					break;
				case 2:
					state.myTasks.forEach(t => t = t.sort((a, b)=> {
						return a.status < b.status? -1:1;
					}))
					break;
				case 3:
					state.myTasks.forEach((t, index) => {
						var limit = t.filter(t=>{return t.limit!=null})
						const noLimit = t.filter(t=>{return t.limit==null})
						if(limit.length>0){
							limit = limit.sort((a, b)=>{
								return a.limit.time.seconds < b.limit.time.seconds ? -1 : 1
							})
							state.myTasks[index] = limit.concat(noLimit)
						}
						else{
							state.myTasks[index] = noLimit
						}
					})
					break;
					// state.myTasks.forEach((ta, index) => {
					// 	let limit = ta.filter(t=>{return t.limit!=null})
					// 	const noLimit = ta.filter(t=>{return t.limit==null})
					// 	if(limit.length>0){
					// 		console.log(limit)
					// 		console.log(limit.sort((a, b)=>{
					// 			a.priority > b.priority ? -1:1;
					// 		}))
					// 		limit = limit.sort((a, b)=>{
					// 			a.limit.time.seconds > b.limit.time.seconds ? -1:1;
					// 		})
					// 		console.log(limit)
					// 		limit.forEach(l=>{
					// 			console.log(l.limit.time.seconds)
					// 		})
					// 		ta = limit.concat(noLimit)
					// 	}
					// 	else{
					// 		ta = noLimit
					// 	}
					// 	state.myTasks[index] = ta
					// })
			}
		},
		showSnackbar(state, text){
			state.snackbar.show = true;
			state.snackbar.text = text;
		},
		dummyFunction() {},
	},
	actions: {
		//表示管理系
		changeMount({ commit }, bool) {
			commit("changeMount", bool);
		},
		setPageNum({ commit }, n) {
			commit("setPageNum", n);
		},
		changeDataLoadedStatus({commit}, bool){
			commit("changeDataLoadedStatus", bool)
		},
		setAppbarTitle({commit}, title){
			commit("setAppbarTitle", title)
		},
		showSnackbar({commit}, text){
			commit("showSnackbar", text)
		},

		//アカウントログイン・登録
		LINElogin: async function ({ commit }) {
			const router = useRouter();
			try{
				await liff.init({
					liffId: "1657390300-KnGv17Dj",
					withLoginOnExternalBrowser: true,
				})
				const profile = await liff.getProfile()
				commit("setUserID", profile.userId);
				const colRef = doc(db, "users", profile.userId);
				const docSnap = await getDoc(colRef);
				if(docSnap.exists()){
					commit("setUserInfo", docSnap.data());
				}
				else{
					router.push("register")
					console.log("yeah")
				}
			} catch (err) {
				console.error(err);
			}

		},
		getUserInfo:async function({commit}, uid){
			const colRef = doc(db, "users", uid);
			const docSnap = await getDoc(colRef);
			if(docSnap.exists()){
				commit("setUserInfo", docSnap.data());
			}
		},
		registerAccount:async function({getters, commit}, userName){
			try{
				const data = {id:getters.userID, name:userName, groups:[]}
				console.log(data)
				await setDoc(doc(db, "users", getters.userID), data);
				commit("setUserInfo", data)
			} catch(err){
				console.error(err);
			}
		},
		updateUserName:async function({state, getters}, newName){
			try{
				await updateDoc(doc(db, "users", getters.userID), {
					name:newName
				});
				state.userInfo.name = newName;
			}
			catch(err){
				console.error(err)
			}
		},

		// getUserInfo: async function ({ commit, getters }) {
		// 	const router = useRouter();
		// 	try {
		// 		const colRef = doc(db, "users", getters.userID);
		// 		const docSnap = await getDoc(colRef);
		// 		if(docSnap.exists()){
		// 			commit("setUserInfo", docSnap.data());
		// 		}
		// 		else{
		// 			router.push("register")
		// 			console.log("yeah")
		// 		}
		// 	} catch (err) {
		// 		console.error(err);
		// 	}
		// },

		getUserNames: async function ({ dispatch, commit, getters }, uids) {
			const idList = [];
			uids.forEach((id) => {
				if (Object.keys(getters.nameList).indexOf(id) == -1) {
					idList.push(id);
				}
			});
			const itemDocs = await Promise.all(
				idList.map((id) => getDoc(doc(db, "users", id)))
			);
			itemDocs.forEach((i) => {
				commit("addUserName", {
					uid: i.data().id,
					name: i.data().name,
				});
			});
			dispatch("changeDataLoadedStatus", {cat:"names", bool:true})
		},

		getGroups: async function ({ commit, getters }) {
			try {
				const groupIDs = getters.userInfo.groups;
				if (groupIDs==undefined) return
				let groups = [];

				const itemsDocs = await Promise.all(
					groupIDs.map((g) => getDoc(doc(db, "groups", g)))
				);
				groups = itemsDocs.map((i) => i.data());
				commit("setMyGroups", groups);
			} catch (err) {
				console.error(err);
			}
		},
		getGroupInfo: async function ({dispatch, commit }, gid) {
			try {
				const colRef = doc(db, "groups", gid);
				const docSnap = await getDoc(colRef);
				commit("setGroupInfo", docSnap.data());
				dispatch("changeDataLoadedStatus", {cat:"groupInfo", bool:true})
			} catch (err) {
				console.error(err);
			}
		},
		deleteGroup:async function({dispatch, getters}, gid){
			try {
				const userID = store.getters.userID;
				const groupArr = store.getters.userInfo.groups.filter(g => g!==gid);
				await updateDoc(doc(db, "users", userID), {
					groups:groupArr,
				});
				const memberArr = store.getters.groupInfo.member.filter(m => m!==userID);
				await updateDoc(doc(db, "groups", gid), {
					member:memberArr
				});
				await dispatch("writeGroupLog", {
					gid:gid,
					content:{
						action:"resignGroup",
						user:getters.userID,
						detail:store.getters.userInfo.name
					}
				})
			}
			catch (err) {
				console.error(err);
			}
		},
		resetGroupInfo({dispatch, commit}){
			commit("setGroupInfo", {});
			dispatch("changeDataLoadedStatus", {cat:"groupInfo", bool:false})
		},
		getTasks: async function ({ commit, getters }) {
			try {
				const taskIDs = getters.groupInfo.tasks;
				let tasks = [];
				const itemsDocs = await Promise.all(
					taskIDs.map((t) => getDoc(doc(db, "tasks", t)))
				);
				tasks = itemsDocs.map((i) => i.data());
				commit("setMyTasks", tasks);
			} catch (err) {
				console.error(err);
			}
		},
		getTaskInfo: async function ({ dispatch, commit }, tid) {
			try {
				const colRef = doc(db, "tasks", tid);
				const docSnap = await getDoc(colRef);
				commit("setTaskInfo", docSnap.data());
				dispatch("changeDataLoadedStatus", {cat:"taskInfo", bool:true})
			} catch (err) {
				console.error(err);
			}
		},
		resetTaskInfo({dispatch, commit}){
			commit("setTaskInfo", {});
			dispatch("changeDataLoadedStatus", {cat:"taskInfo", bool:false})
		},

		addGroup: async function ({ getters, commit }, data) {
			try {
				const newGroupRef = doc(collection(db, "groups"));
				data.group.id = newGroupRef.id;
				console.log(data);
				await setDoc(newGroupRef, data.group);
				await updateDoc(doc(db, "users", getters.userID), {
					groups: arrayUnion(data.group.id)
				});
				commit("addGroup", data.group.id)
			} catch (err) {
				console.error(err);
			}
		},
		joinGroup:async function({dispatch, getters}, gid){
			try{
				await updateDoc(doc(db, "users", getters.userID), {
					groups: arrayUnion(gid)
				});
				await updateDoc(doc(db, "groups", gid), {
					member: arrayUnion(getters.userID)
				});
				await dispatch("writeGroupLog", {
					gid:gid,
					content:{
						action:"joinGroup",
						user:getters.userID,
						detail:null
					}
				})
			}
			catch(err){
				console.error(err);
			}
		},
		registerInviteCode:async function({dispatch, getters}, gid){
			const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
			const N=8
			const code = Array.from(Array(N)).map(()=>S[Math.floor(Math.random()*S.length)]).join('')
			await updateDoc(doc(db, "groups", gid), {
				inviteCode: code,
			});
			await dispatch("writeGroupLog", {
				gid:gid,
				content:{
					action:"registerInviteCode",
					user:getters.userID,
					detail:null
				}
			});
		},
		addTask: async function ({ dispatch, getters }, data) {
			try {
				const newTaskRef = doc(collection(db, "tasks"));
				console.log(data.task.limit)
				data.task.id = newTaskRef.id;
				await setDoc(newTaskRef, data.task);
				await updateDoc(doc(db, "groups", data.GroupID), {
					tasks: arrayUnion(data.task.id),
				});
				await dispatch("writeGroupLog", {
					gid:data.GroupID,
					content:{
						action:"addTask",
						user:getters.userID,
						detail:data.task.title
					}
				})
			} catch (err) {
				console.error(err);
			}
		},
		postComment: async function ({ getters, commit }, data) {
			try {
				await updateDoc(doc(db, "tasks", data.id), {
					comments: arrayUnion({
						content: data.comment,
						id: getters.userID,
						time: Timestamp.fromDate(new Date()),
					}),
				});
				commit("addComment", {
					content: data.comment,
					id: getters.userID,
					time: Timestamp.fromDate(new Date()),
				})
			} catch (err) {
				console.error(err);
			}
		},
		updateTask: async function ({ commit }, data) {
			try {
				console.log(data.data)
				delete data.comment;
				await updateDoc(doc(db, "tasks", data.id), data.data);
			} catch (err) {
				console.error(err);
			}
			commit("mergeTaskInfo", data.data);
		},
		deleteTask:async function({dispatch, getters}, data){
			try {
				await updateDoc(doc(db, "groups", data.gid), {
					tasks: data.taskArray,
				});
				await dispatch("writeGroupLog", {
					gid:data.gid,
					content:{
						action:"deleteTask",
						user:getters.userID,
						detail:{title:data.taskTitle, id:data.tid}
					}
				})
			} catch (err) {
				console.error(err);
			}
		},
		writeGroupLog:async function({commit},data){
			try{
				await updateDoc(doc(db, "groups", data.gid), {
					log:arrayUnion(
						{
							...data.content,
							time: Timestamp.fromDate(new Date()),
						}
						)
				});
				commit("dummyFunction");
			}
			catch(err){
				console.log(err)
			}
		},
		writeTaskLog:async function({commit, getters},data){
			try{
				await updateDoc(doc(db, "tasks", data.tid), {
					log:arrayUnion(
						{
							...data.content,
							time: Timestamp.fromDate(new Date()),
							user:getters.userID
						}
						)
				});
				commit("dummyFunction");
			}
			catch(err){
				console.log(err)
			}
		},
		sortTasks({commit}, mode){
			commit("sortTasks", mode)
		}
	},
});
