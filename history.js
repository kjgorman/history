/*jshint asi:true, expr:true*/
-function () {
  "use strict";
   var idGenerator = genId()

  function History () {
    this.currentBranch = new Branch("master")
    var branches = [this.currentBranch]
    this.branch = function () { return branches }

    Object.defineProperty(this, "HEAD", {
      get: function () { return this.currentBranch.ref }
    })
  }

  History.prototype.checkout = function (branch, create) {
    var existing = first.call(this, function (b) { return b.name === branch })
      , newer
    if (existing === null) {
      if (!create) throw new Error ("no such branch")
      newer = new Branch (branch)
      newer.push (this.HEAD)
      this.branch () . push (newer)
    }

    this.currentBranch = newer || existing
    return this.currentBranch
  }

  History.prototype.commit = function () {
    var c = new Commit()
    this.currentBranch.push(c)
    return c
  }

  History.prototype.merge = function (branch) {
    var existing = first.call(this, function (b) { return b.name === branch })
    if (existing === null)
      throw new Error ("no such branch")
    var c = new Commit()

    c.parents.push(existing.ref)
    this.currentBranch.push(c)
    return c
  }

  History.prototype.log = function () {
    var log = []
      , fringe = [this.HEAD]
      , next

    while (fringe.length > 0) {
      fringe = fringe.sort(function (a, b) {
        return a.id < b.id
      })
      next = fringe.shift()

      fringe = and(fringe,parents(next))
      log.push(next.id)
    }

    return log
  }

  function Branch (name) {
    this.name = name
    this.ref = null
  }

  Branch.prototype.push = function (commit) {
    commit && (commit.parents.push(this.ref))
    this.ref = commit
  }

  function Commit () {
    this.id = idGenerator()
    this.parents = []
  }

  function genId () {
    var id = 0

    return function nextId () {
      return ++ id
    }
  }

  function first (fn) {
    var next
    for (var i = 0, length = this.branch().length; i < length; i++) {
      next = this.branch()[i]
      if (fn(next)) {
        return next
      }
    }
    return null
  }

  function parents (f) {
    return f.parents.filter(function id (x) { return x })
  }

  function flatMap (m, f) {
    return [].concat.apply([], m.map(f))
  }

  function and (a, b) {
    return a.concat(b.filter(function (el) {
      return a.indexOf(el) === -1
    }))
  }

  module.exports = History
}()
