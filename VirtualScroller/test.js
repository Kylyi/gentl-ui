// https://blog.codepen.io/2016/06/08/can-adjust-infinite-loop-protection-timing/
window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 3000
const PAGE_SIZE = 50
const EMIT_ENABLED = true

const bus = new Vue({})

// https://dev.to/adamklein/build-your-own-virtual-scroll-part-ii-3j86
// define a mixin object to check if the browser supports the option passive that can be used while dealing with scroll events
const PassiveSupportMixin = {
  methods: {
    // This snippet is taken straight from https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    // It will only work on browser so if you are using in an SSR environment, keep your eyes open
    doesBrowserSupportPassiveScroll() {
      let passiveSupported = false

      try {
        const options = {
          get passive() {
            // This function will be called when the browser
            //   attempts to access the passive property.
            passiveSupported = true
            return false
          },
        }

        window.addEventListener('test', null, options)
        window.removeEventListener('test', null, options)
      } catch (err) {
        passiveSupported = false
      }
      return passiveSupported
    },
  },
}

/**
No need for this in production, just remove the mixin from the component
*/
const EmitMixin = {
  methods: {
    emit() {
      bus.$emit('scroll-top', this.scrollTop)
      bus.$emit('viewport-height', this.viewportHeight)
      bus.$emit('heights', this.heights)
      bus.$emit('page-positions', this.rollingPageHeights)
      bus.$emit('translate-y', this.translateY)
      bus.$emit('page-start-index', this.pageStartIndex)
      bus.$emit('start-index', this.startIndex)
      bus.$emit('end-index', this.endIndex)
      bus.$emit('smallest-height', this.smallestRowHeight)
      bus.$emit('largest-height', this.largestRowHeight)
      bus.$emit('root-height', this.rootHeight)
      bus.$emit('row-positions', this.rowPositions)
      bus.$emit(
        'visible-items',
        this.visibleItems.map(item => item.index)
      )
    },
  },
}

const SearchMixin = {
  methods: {
    binarySearch(arr, x) {
      let low = 0
      let high = Array.isArray(arr)
        ? arr.length - 1
        : Object.keys(arr).length - 1
      let mid
      while (low < high) {
        mid = Math.floor((high + low) / 2)
        // Check if x is present at middle position
        if (arr[mid] == x) {
          break
        } else if (arr[mid] > x) {
          high = mid - 1
        } else {
          low = mid + 1
        }
      }
      mid = Math.floor((high + low) / 2)
      if (x <= arr[mid]) {
        return mid
      } else {
        return mid + 1
      }
    },
    /**
    Given a scroll top value, the map containing id of the each row as key and its vertical position from the top of the viewport in px and the number of total number of items available, find the index of the first node that is just above the current scroll top value or in simple words, find the index of the item that is just not seen by the user and is above the current scroll bar position
    */
    findStartNode(scrollTop, nodePositions, itemCount) {
      let startRange = 0
      let endRange = itemCount - 1
      while (endRange !== startRange) {
        const middle = Math.floor((endRange - startRange) / 2 + startRange)
        if (
          nodePositions[middle] <= scrollTop &&
          nodePositions[middle + 1] > scrollTop
        ) {
          return middle
        }
        if (middle === startRange) {
          // edge case - start and end range are consecutive
          return endRange
        } else if (nodePositions[middle] <= scrollTop) {
          startRange = middle
        } else {
          endRange = middle
        }
      }
      return itemCount
    },
  },
}

const DummyDataMixin = {
  data() {
    return {
      minWordCount: 3,
      maxWordCount: 50,
    }
  },
  methods: {
    dummyData(currentLength) {
      const items = []
      const length = PAGE_SIZE
      for (let i = 0; i < length; i++) {
        const wordCount =
          this.minWordCount +
          Math.floor(Math.random() * (this.maxWordCount - this.minWordCount))
        // For each item we take a UUID, an index and a value
        // UUID clashes here will be bad
        items.push({
          id: faker.random.uuid(),
          index: currentLength + i,
          value: `Item ${faker.random.words(wordCount)}`,
        })
      }
      return items
    },
  },
}

Vue.component('VirtualList', {
  mixins: [DummyDataMixin, SearchMixin, PassiveSupportMixin, EmitMixin],
  data() {
    return {
      // Has the mount() been called yet atleast once?
      isMounted: false,
      // Are items currently loading as part of the infinite scroll?, handly if you got AJAX calls
      isLoading: false,
      // Should events corresponding to data changes be emitted from this component?
      // Disable this in production to cut emitting events
      isEmitEnabled: EMIT_ENABLED,
      // Index of the starting page, each page has PAGE_SIZE items
      pageStartIndex: 0,
      // Index of the first list item on DOM
      startIndex: 0,
      endIndex: PAGE_SIZE,
      // List of all the items out of which a subset will be rendered on DOM
      items: [],
      // Height of each row
      heights: [],
      // Total height per page
      // On page 0 , lets say all PAGE_SIZE rows add up to 2000
      // On page 1, lets say all PAGE_SIZE rows add up to 2500, then
      // rollingPageHeights: [2000, 4500]
      // page 1 = page 0 height of PAGE_SIZE items + page 1 height of PAGE_SIZE items
      rollingPageHeights: [],
      // Height of the smallest row
      smallestRowHeight: Number.MAX_SAFE_INTEGER,
      // Height of the largest row
      largestRowHeight: Number.MIN_SAFE_INTEGER,
      // How much to shift the spacer vertically so that the scrollbar is not disturbed when hiding items
      translateY: 0,
      // Height of the outermost div inside which all the list items are present
      rootHeight: 0,
      // Total height of all the rows of all the pages
      viewportHeight: 0,
      // Current scroll position
      scrollTop: 0,
      renderAhead: 10,

      // The id of the currently selected item, by default set to 0
      selectedIndex: 0,
    }
  },
  computed: {
    /**  If the current page is 0, take a slice of the heights of all rows from index 0 to 49
	If the current page is 1, the slice goes from index 50 to 99

	  We need the total height till the end of wherever we will scroll to
	  Let's say we have scrolled 2 pages down, page 0 and page 1
	  Page 0 had 50 rows with a height of 2000 px
	  For page 0, total height is 2000px
	  Page 1 had 50 rows with a height of 2500 px
	  For page 1, total height is 2000 + 2500 = 4500px and this goes on increasing with each page
	  rollingPageHeights currently would contain an array [2000, 4500]
	  For any scroll top less than 2000, we know that we are on page 0 now
	 Now we try to find how far each row is from the top of its current page
	  If page 0 has 50 rows with heights say 25 30 35 40 ...
	  Row 1 of page 0 is 0 from top of page 0
	  Row 2 of page 0 is 25 from top of page 0
	  Row 3 of page 0 is 25 + 30 = 55 from top of page 0
	  Row 4 of page 0 is 25 + 30 + 35 = 90 from top of page 0
	  If page 1 has 50 rows with heights 25 30 35 40, remember that page 1 itself is 2000px from top of the viewport
	  Row 0 of page 1 is 0 + 2000 from top of page 1
	  Row 1 of page 1 is 25 + 2000 = 2025 from top of page 1
	  Row 2 of page 1 is 25 + 30 + 2000 = 2055 from top of page 1
	  Row 3 of page 1 is 25 + 30 + 35 + 2000 = 2090 from top of page 1
	  We ll get a bunch of ever increasing numbers for a given page and we need to find out where the scroll top lies to identify the start index
	*/
    rowPositions() {
      const currentHeights = this.heights.slice(
        this.pageStartIndex * PAGE_SIZE,
        (this.pageStartIndex + 1) * PAGE_SIZE
      )
      let totalDisplacement =
        this.rollingPageHeights[this.pageStartIndex - 1] || 0
      const displacements = []
      for (let i = 0; i < currentHeights.length; i++) {
        displacements.push(totalDisplacement)
        totalDisplacement += currentHeights[i]
      }
      displacements.push(totalDisplacement)
      return displacements
    },
    /**
	Subset of list items rendered on the DOM
	*/
    visibleItems() {
      return this.items.slice(this.startIndex, this.endIndex)
    },
    /**
    Translate the spacer verticaly to keep the scrollbar intact
    We only show N items at a time so the scrollbar would get affected if we dont translate
    */
    spacerStyle() {
      return {
        willChange: 'auto',
        transform: `translateY(${this.translateY}px)`,
      }
    },
    /**
    Set the height of the viewport
    For a list where all items are of equal height, height of the viewport = number of items x height of each item
    For a list where all items are of different height, it is the sum of height of each row
    */
    viewportStyle() {
      return {
        height: `${this.viewportHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        willChange: 'auto',
      }
    },
  },
  template: '#virtual-list',
  methods: {
    init() {
      this.isMounted = true
      // Insert the dummy data
      const insertedItems = this.dummyData(this.items.length)
      this.items.push(...insertedItems)

      // Check if browser supports passive scroll and add scroll event listener
      this.$el.addEventListener(
        'scroll',
        this.handleScroll,
        this.doesBrowserSupportPassiveScroll() ? { passive: true } : false
      )

      window.addEventListener('keydown', this.handleKeyDown)

      // After the items are added when they are rendered on DOM, update the heights and other properties
      this.$nextTick(() => {
        this.update(insertedItems)
        // this.update2();
        // Observe one or multiple elements
        this.isEmitEnabled && this.emit()
      })
    },
    select(itemId) {
      this.selectedIndex = itemId
      // scrollIntoViewIfNeeded(this.$el, this.childPositions[itemId]);
      // this.$el.children[item.id].scrollIntoView({ behavior: "smooth" });
    },

    scrollTo(index) {
      const pageStartIndex = Math.floor(index / PAGE_SIZE)

      const currentHeights = this.heights.slice(
        pageStartIndex * PAGE_SIZE,
        (pageStartIndex + 1) * PAGE_SIZE
      )
      let totalDisplacement = this.rollingPageHeights[pageStartIndex - 1] || 0
      const displacements = []
      for (let i = 0; i < currentHeights.length; i++) {
        displacements.push(totalDisplacement)
        totalDisplacement += currentHeights[i]
      }
      displacements.push(totalDisplacement)
      // console.log(pageStartIndex, this.rollingPageHeights[pageStartIndex], this.heights.slice(pageStartIndex * PAGE_SIZE, (pageStartIndex + 1) * PAGE_SIZE), displacements[index]);
      const top = displacements[index % PAGE_SIZE]
      const isVisible =
        top >= this.scrollTop && top <= this.scrollTop + this.$el.offsetHeight
      if (!isVisible) {
        this.$el.scrollTo({
          left: 0,
          top: displacements[index % PAGE_SIZE],
          behavior: 'smooth',
        })
      }
    },

    handleKeyDown(event) {
      switch (event.keyCode) {
        // In case of left arrow key move to the last item
        case 37:
          if (this.selectedIndex > 0) {
            this.select(this.selectedIndex - 1)
            this.scrollTo(this.selectedIndex)
          }
          // Prevent the default scroll event from firing
          event.preventDefault()
          break
        // In case of up arrow key, move to the last item
        case 38:
          if (this.selectedIndex > 0) {
            this.select(this.selectedIndex - 1)
            this.scrollTo(this.selectedIndex)
          }
          event.preventDefault()
          break
        // In case of right arrow key, move to the next item
        case 39:
          if (this.selectedIndex < this.items.length - 1) {
            this.select(this.selectedIndex + 1)
            this.scrollTo(this.selectedIndex)
          }
          event.preventDefault()
          break
        // In case of down arrow key, move to the next item
        case 40:
          if (this.selectedIndex < this.items.length - 1) {
            this.select(this.selectedIndex + 1)
            this.scrollTo(this.selectedIndex)
          }
          event.preventDefault()
          break
      }
    },

    update(insertedItems) {
      for (let i = 0; i < insertedItems.length; i++) {
        // Get the id and index of the inserted items from the array
        const { id, index } = insertedItems[i]
        // Check if the id has been rendered on DOM and is available
        if (this.$refs[id] && this.$refs[id][0]) {
          // Get the scroll height and update the height of the item at index
          const height = this.$refs[id][0].scrollHeight
          this.heights[index] = height
          // Update the largest and smallest row heights
          this.largestRowHeight =
            height > this.largestRowHeight ? height : this.largestRowHeight
          this.smallestRowHeight =
            height < this.smallestRowHeight ? height : this.smallestRowHeight
          // Given an item index, compute the page index
          // For example, any item index from 0 to 40 would translate to page index 0
          // Any item with index 50 to 99 would translate to page index 1
          const pageIndex = Math.floor(index / PAGE_SIZE)
          if (pageIndex === 0) {
            if (!this.rollingPageHeights[pageIndex]) {
              this.rollingPageHeights[pageIndex] = 0
            }
          } else if (!this.rollingPageHeights[pageIndex]) {
            this.rollingPageHeights[pageIndex] =
              this.rollingPageHeights[pageIndex - 1]
          }
          // Add the height of the row to the total height of all rows on the current page
          this.rollingPageHeights[pageIndex] += height
        }
        // else {
        //   console.log(id, "was not found");
        // }
      }
      this.rootHeight = this.$el.offsetHeight
      // Total height of the viewport is the sum of heights of all the rows on all the pages currently stored at the last index of page positions
      // For our example with page 0 of 2000px and page 1 of 2500px, the rollingPageHeights array looks like [2000, 4500]
      // Viewport height = 4500px
      this.viewportHeight =
        this.rollingPageHeights[this.rollingPageHeights.length - 1]
    },

    handleScroll: _.throttle(function () {
      const { scrollTop, offsetHeight, scrollHeight } = this.$el
      this.scrollTop = scrollTop
      this.isEmitEnabled && this.emit()
      if (scrollTop + offsetHeight >= scrollHeight - 10) {
        this.loadMore()
      }
    }, 17),
    loadMore() {
      // Mark the loading status
      this.isLoading = true
      setTimeout(() => {
        // Add more dummy data
        const insertedItems = this.dummyData(this.items.length)
        this.items.push(...insertedItems)
        // Very important to update the end index here to be the page size at this stage
        // If you are on page 0 with 50 items and loaded 50 more items, endIndex is set to 100
        // Without this step, the 50 new items on DOM are not rendered and therefore we dont get their heights

        // REMOVING this LINE will CRASH THE ENTIRE COMPONENT
        // If you have a better idea, you better comment :)
        this.endIndex =
          Math.floor(this.items[this.items.length - 1].index / PAGE_SIZE) *
            PAGE_SIZE +
          PAGE_SIZE
        this.$nextTick(() => {
          // Update the heights for the newly inserted rows
          this.update(insertedItems)
          // this.update2();
          this.isEmitEnabled && this.emit()
          this.isLoading = false
        })
      }, 1)
    },
  },
  watch: {
    /**
	We just need a start index and an end index based on our current scroll top to decide which subset of the items to render
	We also need to take care that the translateY value is according to our start index
	There are multiple ways of doing this, feel free to try any of the methods our or comment to suggest a better method if you know
	Let us again take the example of 2 pages 2000px and 2500px
	rollingPageHeights: [2000, 4500]

	Method 1
	Using the scroll top, get the current page index
	pageStartIndex = 0 if scroll top < 2000
	startIndex = 0 x 50 = 0
	pageStartIndex = 1 if scroll top >= 2000 and scroll top <= 4500
	startIndex = 1 x 50 = 50
	and so on...
	End index for this combination can be calculated in many ways
	One simple way is start index + 50
	At page 0 we translate by 0 px
	At page 1 we translate by height of page 0 = 2000px and so on
	The change from 0 50 in the start index is rather abrupt and you can observe a flicker if going by this route
	Also since the end index does not change, when you are at item 45, you can only see 5 more items because you ll have to scroll beyond 50 to see the next 50 items
	If the height of the page is more than 50 items, we have a problem in this approach
	startIndex = pageStartIndex * PAGE_SIZE
	endIndex = startIndex + PAGE_SIZE
	translateY = rollingPageHeights[pageStartIndex - 1] || 0 (for the 0th page)
  This method does NOTgive a smooth scrolling experience because when you reach the end of the page, blank space is seen until you scroll beyond and the next page is loaded

	Method 2
	Here we are talking about a different method that involves guesstimating startIndex
	Take 10 rows of different heights and their respective displacements from the top of the current page
	10px => 0
	20px => 0 + 10 = 10
	30px => 10 + 20 = 30
	40px => 10 + 20 + 30 = 60
	35px => 10 + .. + 40 = 100
	30px => 10 + .. + 35 = 135
	25px => 10 + .. + 30 = 165
	20px => 10 + .. + 25 = 190
	35px => 10 + .. + 20 = 210
	30px => 10 + .. + 35 = 245
		 => 10 + .. + 30 = 275
	Given a scroll top we just need to find the start index
	When the scroll top is below 10 we know that row 0 is at the top
	We can find this by doing a binary search or a better alternative
	We simply take the scroll top and integer divide by the largest item
	It will always give a start index slighly above the scroll top
	
	For example, let's say scroll top is 91 and largest row height is 40

	startIndex = Math.floor(scrollTop / largest row height)
	startIndex = Math.floor(91 / 40) = 2

	If you did a binary search, 91 lies between 60 and 100 so the row start index could be either 3 or 4 depending on how you round it
	But we arrived at a number 2 quickly without doing any search didn't we? That is the beauty of this method, its a O(1) operation instead of binary search which is O(logN)
	The end index can be obtained by doing the exact opposite, which is to take the scroll top and height of the root element and dividing that by the smallest number
	If the height of the root container is 100px and current scroll is the same

	endIndex = Math.floor((scrollTop + container height) / smallest row height)
	endIndex = Math.floor((91 + 100) / 10) = 19

	Another way of calculating the endIndex would be 

	endIndex = startIndex + Math.floor(container height / smallest row height)
	= 2 + Math.floor(100 / 10) = 12

	As the scroll top is 91 and the total height of the visible area is 100 px, the user can see upto 191 px on screen
	Any of the above ways of calculating the end index should give you an end index that lies well beyond the visible area
	If you did a binary search to find where the end index lies, your value 191 lies between positions 7 and 8 depending on how you round it
	But we did it in O(1) time without a binary search
	Now all we need to do is apply the translate properly, our start index is 2, so we are starting at the row at index 2 which is 30px tall, translate is 10 + 20 = 30px
	The only problem is that as we scroll down and down, the start and end index starts getting further and further apart and more and more items are rendered on the DOM
	translateY = rowPositions[startIndex]
	

	The solution to this problem is to adjust the start and end index on each 
	Take the example of 2 pages

	Page 0
	10px => 0
	20px => 0 + 10 = 10
	30px => 10 + 20 = 30
	40px => 10 + 20 + 30 = 60
	35px => 10 + .. + 40 = 100
	30px => 10 + .. + 35 = 135
	25px => 10 + .. + 30 = 165
	20px => 10 + .. + 25 = 190
	35px => 10 + .. + 20 = 210
	30px => 10 + .. + 35 = 245
		 => 10 + .. + 30 = 275
	Total height of page 0 = 10 + .. + 30 = 275px
	
	Page 1
	20px => 275
	25px => 275 + 20 = 295
	30px => 275 + 20 + 25 = 320
	35px => 275 + .. + 30 = 350
	35px => 275 + .. + 35 = 385
	40px => 275 + .. + 35 = 420
	30px => 275 + .. + 40 = 460
	15px => 275 + .. + 30 = 490
	30px => 275 + .. + 15 = 505
	15px => 275 + .. + 30 = 535
		 => 275 + .. + 15 = 550
	Total height of page 1 = 275px
	Total height till the end of page 1 = 275 + 275 = 550px

	Let us say the scroll top is currently at 325 and container height is 100px

	Without adjustment

	startIndex = Math.floor(scrollTop / largest row height)
	startIndex = Math.floor(325 / 40) = 8, row 8 is actually on Page 0
	
	endIndex = Math.floor((scrollTop + container height) / smallest row height)
	endIndex = Math.floor((325 + 100) / 10) = 42 which is not even there!
	
	If we use the previous technique of calculating the endIndex directly from the startIndex

	endIndex = startIndex + Math.floor(container height / smallest row height)
	endIndex = 8 + Math.floor((325 + 100) / 100)	

	As we scroll further and further, the DRIFT gets higher and higher

	With adjustment

	We know that the 1st 275px is of page 0 and has  10 rows, all we need to do is remove this from the current calculation
	
	startIndex = total number of rows before current page + Math.floor((scrollTop - total height of all rows before current page) / largest row height)
	startIndex = 10 rows of page 0 + Math.floor((325 - 275 px of page 0) / 40)	= 11

	endIndex = total number of rows before current page + Math.floor((scrollTop + container height - total height of all rows before current page) / smallest row height)
	endIndex = 10 + Math.floor((325 + 100 - 275) / 10) = 25

	If we use the previous technique of calculating the endIndex directly from the startIndex

	endIndex = startIndex + Math.floor(container height / smallest row height)
	endIndex = 11 + Math.floor(100 / 10) = 21
  
  The translate in this method is not applied properly and what I observed is the spacer keeps moving higher and higher and we see an increasing amount of blank space as we scroll down till the entire page is blank

	Method 3
	Do a binary search for the start index
	The end index can be calculated either via binary search or from the start index using the formula below
	endIndex = startIndex + Math.floor(container height / smallest row height)
	
  This is the method currently USED
	

	*/
    scrollTop(newValue, oldValue) {
      this.pageStartIndex = this.binarySearch(
        this.rollingPageHeights,
        this.scrollTop
      )

      const startNodeIndex = Math.max(
        0,
        this.findStartNode(
          this.scrollTop,
          this.rowPositions,
          this.rowPositions.length
        )
      )
      this.startIndex = this.pageStartIndex * PAGE_SIZE + startNodeIndex

      this.endIndex =
        this.startIndex + Math.floor(this.rootHeight / this.smallestRowHeight)

      this.translateY = this.rowPositions[startNodeIndex]
    },
  },
  mounted() {
    this.init()
    // https://stackoverflow.com/questions/641857/javascript-window-resize-event/641874#641874
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect
        console.log('Element:', entry.target, cr)
        this.rootHeight = cr.height
        this.isEmitEnabled && this.emit()
        //         const children = this.$refs.spacer.children;

        //         for (let i = 0; i < children.length; i++) {
        //           const { id, scrollHeight } = children[i];
        //           const index = children[i].getAttribute("data-index");
        //           console.log(index, scrollHeight, this.heights[index]);
        //         }
      }
    })
    ro.observe(this.$el)
  },
  unmounted() {
    this.$el.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('keydown', this.handleKeyDown)
    this.isMounted = false
  },
})

new Vue({
  el: '#app',
  data() {
    return { store: {} }
  },
  mounted() {
    for (const event of [
      'scroll-top',
      'viewport-height',
      'heights',
      'page-positions',
      'translate-y',
      'page-start-index',
      'start-index',
      'end-index',
      'smallest-height',
      'largest-height',
      'root-height',
      'row-positions',
      'visible-items',
    ]) {
      bus.$on(event, value => {
        Vue.set(this.store, event, value)
      })
    }
  },
})
