const { readFileSync, readdirSync } = require('fs')
const path = require('path')

window.exports = {
	idiom: {
		mode: 'list',
		args: {
			// 进入插件时调用（可选）
			enter: () => {},
			// 子输入框内容变化时被调用
			search: (action, searchWord, callbackSetList) => {
				if (!searchWord) return callbackSetList([])
				const myData = JSON.parse(readFileSync(path.join(__dirname, '/json-data/idiom.json'), 'utf-8'))
				const idiomResult = []
				for (let i = 0; i < myData.length; i++) {
					let temp = myData[i]
					if (temp.word.includes(searchWord)) {
						idiomResult.push(temp)
					}
				}
				// 搜索结果
				let result = idiomResult.map((item) => {
					return {
						title: item.word,
						description: `${item.pinyin} ${item.explanation}`,
						icon: '/images/Mang.png', // 图标
						url: `https://www.zdic.net/hans/${item.word}`,
					}
				})
				return callbackSetList(result)
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData, callbackSetList) => {
				utools.copyText(itemData.title)
				utools.showNotification(`${itemData.title}复制成功`)
			},
			// 子输入框为空时的占位符，默认为字符串"搜索"
			placeholder: '请输入成语',
		},
	},
	poetry: {
		mode: 'list',
		args: {
			enter: () => {},
			search: (action, searchWord, callbackSetList) => {
				if (!searchWord) return callbackSetList([])
				let myData = []
				let poetryResult = []

				// 指定要读取的目录路径
				const directoryPath = path.join(__dirname, '/json-data')
				const files = readdirSync(directoryPath)

				// 遍历所有文件
				files.forEach((file) => {
					if (file === 'idiom.json') return
					const filePath = path.join(directoryPath, file)
					const fileContent = readFileSync(filePath, 'utf-8')
					myData.push(...JSON.parse(fileContent))
				})

				// 匹配结果
				for (let i = 0; i < myData.length; i++) {
					let temp = myData[i]
					let paragraphs = temp.paragraphs
					if (temp?.author?.includes(searchWord) || temp.title.includes(searchWord)) {
						poetryResult.push(temp)
					}
					for (let j = 0; j < paragraphs.length; j++) {
						if (paragraphs[j].includes(searchWord)) {
							poetryResult.push(temp)
						}
					}
				}
				// 去重
				function uniqueObjects(arr, getKey) {
					const map = new Map()
					const uniqueArr = []
					arr.forEach((item) => {
						const key = getKey ? getKey(item) : JSON.stringify(item)
						if (!map.has(key)) {
							map.set(key, item)
							uniqueArr.push(item)
						}
					})
					return uniqueArr
				}
				poetryResult = uniqueObjects(poetryResult, (item) => item.paragraphs[0])

				let result = poetryResult.map((item) => {
					return {
						title: `${item.title} ${item.author}`,
						description: item.paragraphs,
						icon: '/images/winter.png', // 图标
						url: `https://so.gushiwen.cn/search.aspx?value=${item.title}&valuej=${item.title.substring(0, 1)}`,
					}
				})
				return callbackSetList(result)
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData, callbackSetList) => {
				window.utools.hideMainWindow()
				utools.ubrowser.goto(itemData.url).value(itemData.title).click('#sb_form_go').run()
				// utools.shellOpenExternal(itemData.url)
			},
			placeholder: '输入关键字作者或标题',
		},
	},
}
