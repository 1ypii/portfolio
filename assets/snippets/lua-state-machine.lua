local StateMachine = {}
StateMachine.__index = StateMachine

function StateMachine.new(config)
    local self = setmetatable({}, StateMachine)

    self.states = {}
    self.transitions = {}
    self.currentState = nil
    self.previousState = nil
    self.locked = false
    self.history = {}
    self.maxHistory = config and config.maxHistory or 50
    self.onTransition = config and config.onTransition or nil

    return self
end

function StateMachine:addState(name, callbacks)
    self.states[name] = {
        enter = callbacks and callbacks.enter or nil,
        update = callbacks and callbacks.update or nil,
        exit = callbacks and callbacks.exit or nil,
    }
end

function StateMachine:addTransition(from, to, guard)
    if not self.transitions[from] then
        self.transitions[from] = {}
    end

    table.insert(self.transitions[from], {
        target = to,
        guard = guard or nil,
    })
end

function StateMachine:canTransition(targetState)
    if self.locked then
        return false
    end

    if not self.currentState then
        return self.states[targetState] ~= nil
    end

    local available = self.transitions[self.currentState]
    if not available then
        return false
    end

    for _, transition in ipairs(available) do
        if transition.target == targetState then
            if transition.guard then
                return transition.guard(self.currentState, targetState)
            end
            return true
        end
    end

    return false
end

function StateMachine:transitionTo(targetState, payload)
    if not self.states[targetState] then
        warn("State '" .. targetState .. "' does not exist")
        return false
    end

    if not self:canTransition(targetState) then
        return false
    end

    self.locked = true
    local fromState = self.currentState

    if fromState and self.states[fromState].exit then
        self.states[fromState].exit(payload)
    end

    self.previousState = fromState
    self.currentState = targetState

    table.insert(self.history, {
        from = fromState,
        to = targetState,
        timestamp = os.clock(),
    })

    if #self.history > self.maxHistory then
        table.remove(self.history, 1)
    end

    if self.states[targetState].enter then
        self.states[targetState].enter(payload)
    end

    if self.onTransition then
        self.onTransition(fromState, targetState, payload)
    end

    self.locked = false
    return true
end

function StateMachine:update(dt)
    if not self.currentState then
        return
    end

    local state = self.states[self.currentState]
    if state and state.update then
        state.update(dt)
    end
end

function StateMachine:getCurrent()
    return self.currentState
end

function StateMachine:getPrevious()
    return self.previousState
end

function StateMachine:isInState(name)
    return self.currentState == name
end

function StateMachine:getHistory()
    return self.history
end

function StateMachine:reset(initialState)
    local fromState = self.currentState

    if fromState and self.states[fromState] and self.states[fromState].exit then
        self.states[fromState].exit()
    end

    self.currentState = nil
    self.previousState = nil
    self.locked = false
    self.history = {}

    if initialState then
        self:transitionTo(initialState)
    end
end

function StateMachine:destroy()
    self.states = nil
    self.transitions = nil
    self.history = nil
    self.onTransition = nil
    self.currentState = nil
    self.previousState = nil
    setmetatable(self, nil)
end

return StateMachine
