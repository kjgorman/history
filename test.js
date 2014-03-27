var History = require("./history")
  , assert = require("assert")

describe("commits", function () {
  it("should generate unique ids on construction", function () {
    var hist = new History()
      , a = hist.commit()
      , b = hist.commit()

    assert.notEqual(a.id, b.id)
  })

  it("should be a monotonically increasing sequence", function () {
    var hist = new History()
      , a = hist.commit()
      , b = hist.commit()

    assert.equal(true, a.id < b.id)
  })

  it("should set the parent", function () {
    var hist = new History()
      , a = hist.commit()
      , b = hist.commit()

    assert.equal(b.parents[0], a)
  })
})

describe("branching", function () {
  it("should be on master by default", function () {
    var hist = new History()

    assert.equal(hist.currentBranch.name, "master")
  })

  it("should throw when checking out a branch that doesn't exist", function () {
    var hist = new History()

    assert.throws(function () {
      hist.checkout("huh")
    }, Error)
  })

  it("should create and move branch when told to", function () {
    var hist = new History()

    hist.checkout ("huh", true)

    assert.equal(hist.currentBranch.name, "huh")
  })

  it("should be on the same commit as was branched from", function () {
    var hist = new History()
      , c = hist.commit()

    hist.checkout ("yea", true)
    assert.equal(c, hist.HEAD)
  })

  it("should add a commit only to the current branch", function () {
    var hist = new History(), c
    hist.commit()

    hist.checkout ("yea", true)
    var c = hist.commit()
    assert.equal(c, hist.HEAD)
    hist.checkout ("master")
    assert.notEqual(c, hist.HEAD)
  })
})

describe("merging", function () {
  it("should create a merge commit", function () {
    var hist = new History()
      , a = hist.commit()
      , b, c
    hist.checkout("huh", true)
    var b = hist.commit()
    hist.checkout("master")
    var c = hist.merge("huh")

    assert.notEqual(b, hist.HEAD)
    assert.equal(c, hist.HEAD)
  })

  it("should have both branches prior refs as parents", function () {
    var hist = new History()
      , a = hist.commit()
      , b, c
    hist.checkout("huh", true)
    var b = hist.commit()
    hist.checkout("master")
    var c = hist.merge("huh")

    assert.deepEqual(c.parents, [b, a])
  })
})

describe("log", function () {
  it("should describe a monotonic sequence for a linear history", function () {
    var hist = new History()
      , a = hist.commit()
      , b = hist.commit()
      , l = hist.log()

    assert.deepEqual([b.id, a.id], l)
  })

  it("should describe a monotonic sequence for branched history", function () {
    var hist = new History()
      , a = hist.commit()
    hist.checkout("huh", true)
    var b = hist.commit()
    hist.checkout("foo", true)
    var c = hist.commit()
    hist.checkout("master")
    var d = hist.commit()
      , e = hist.merge("foo")
      , l = hist.log()

    /*      22
          /  \
        /     \
       20      \
        \       \
        19     21
          \   /
           18
    */
    assert.deepEqual([e.id, d.id, c.id, b.id, a.id], l)
  })

})
