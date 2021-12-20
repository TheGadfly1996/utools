const { readFileSync } = require('fs')
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
				const myData = JSON.parse(readFileSync(path.join(__dirname, './idiom.json'), 'utf-8'))
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
						icon: '芒种.png', // 图标
						url: `https://www.zdic.net/hans/${item.word}`,
					}
				})
				return callbackSetList(result)
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData, callbackSetList) => {
				window.utools.hideMainWindow()
				utools.shellOpenExternal(itemData.url)
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
				const poetryResult = []
				const poetryStatus = ['唐诗三百首', '宋词三百首', '教科书']

				poetryStatus.forEach((item) => {
					myData = JSON.parse(readFileSync(path.join(__dirname, `./${item}.json`), 'utf-8'))
				})
				// 匹配结果
				for (let i = 0; i < myData.length; i++) {
					let temp = myData[i]
					let paragraphs = temp.paragraphs
					if (temp.author.includes(searchWord) || temp.title.includes(searchWord)) {
						poetryResult.push(temp)
					}
					for (let j = 0; j < paragraphs.length; j++) {
						if (paragraphs[j].includes(searchWord)) {
							poetryResult.push(temp)
						}
					}
				}
				// 去重
				for (var i = 0; i < poetryResult.length - 1; i++) {
					for (var j = i + 1; j < poetryResult.length; j++) {
						if (poetryResult[i].paragraphs.join() === poetryResult[j].paragraphs.join()) {
							poetryResult.splice(j, 1)
							j--
						}
					}
				}
				let result = poetryResult.map((item) => {
					return {
						title: `${item.title} ${item.author}`,
						description: item.paragraphs,
						icon: '冬.png', // 图标
						url: `https://so.gushiwen.cn/search.aspx?value=${item.title}`,
					}
				})
				return callbackSetList(result)
			},
			// 用户选择列表中某个条目时被调用
			select: (action, itemData, callbackSetList) => {
				window.utools.hideMainWindow()
				utools.shellOpenExternal(itemData.url)
			},
			placeholder: '输入关键字作者或标题',
		},
	},
}
