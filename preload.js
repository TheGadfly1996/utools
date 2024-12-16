const { readFileSync, readdirSync } = require('fs')
const path = require('path')

// 添加一个通用的读取和解析 JSON 文件的函数
const readJsonFile = (filePath) => {
	try {
		const data = readFileSync(filePath, 'utf-8')
		return JSON.parse(data)
	} catch (error) {
		console.error(`Error reading or parsing JSON from ${filePath}:`, error)
		return []
	}
}

window.exports = {
	idiom: {
		mode: 'list',
		args: {
			// 进入插件时调用（可选）
			enter: () => {},
			// 子输入框内容变化时被调用
			search: (action, searchWord, callbackSetList) => {
				if (!searchWord) return callbackSetList([])
				const myData = readJsonFile(path.join(__dirname, '/json-data/idiom.json'))
				const idiomResult = myData.filter((item) => item.word.includes(searchWord))
				let result = idiomResult.map((item) => ({
					title: item.word,
					description: `${item.pinyin} ${item.explanation}`,
					icon: '/images/Mang.png',
					url: `https://www.zdic.net/hans/${item.word}`,
				}))
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
				// ! 读取文件
				if (!searchWord) return callbackSetList([])
				const directoryPath = path.join(__dirname, '/json-data')
				const files = readdirSync(directoryPath)
				let myData = files
					.filter((file) => file !== 'idiom.json')
					.map((file) => readJsonFile(path.join(directoryPath, file)))
					.flat()

				// ! 过滤并去重
				let poetryResult = myData.filter((item) => item.author.includes(searchWord) || item.title.includes(searchWord) || item.paragraphs.some((paragraph) => paragraph.includes(searchWord)))
				poetryResult = [...new Map(poetryResult.map((item) => [`${item.title}-${item.author}`, item])).values()]

				// ! 返回结果
				let result = poetryResult.map((item) => ({
					title: `${item.title} ${item.author}`,
					description: item.paragraphs,
					icon: '/images/winter.png',
					url: `https://so.gushiwen.cn/search.aspx?value=${item.title}&valuej=${item.title.substring(0, 1)}`,
				}))
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
	daily: {
		mode: 'list',
		args: {
			enter: () => {
				// 随机诗词
				const directoryPath = path.join(__dirname, '/json-data')
				const files = readdirSync(directoryPath)
				let myData = files
					.filter((file) => file !== 'idiom.json')
					.map((file) => readJsonFile(path.join(directoryPath, file)))
					.flat()

				let randomPoem = myData[Math.floor(Math.random() * myData.length)].title
				if (randomPoem) {
					utools.outPlugin()
					utools.ubrowser
						.goto(`https://so.gushiwen.cn/search.aspx?value=${randomPoem}&valuej=${randomPoem.substring(0, 1)}`)
						.click('.sons a')
						.run()
				}
			},
		},
	},
}
