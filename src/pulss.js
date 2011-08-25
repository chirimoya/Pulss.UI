var Pulss = { version: '0.0.1' };

Pulss.Logger = { hasConsole: (typeof(window.console) != 'undefined') };

Object.extend(Pulss.Logger, { 
    debug: function(msg) {
        if (this.hasConsole) console.debug(msg);
    },
    info: function(msg) {
        if (this.hasConsole) console.info(msg);
    },
    warn: function(msg) {
        if (this.hasConsole) console.warn(msg);
    },
    error: function(msg) {
        if (this.hasConsole) console.error(msg);
    }
});

Pulss.Utilities = { };

Pulss.Utilities.String = { };

Object.extend(Pulss.Utilities.String, {
    getStringMaxCharacter: function(str, maxLength) {
        if (str.length > maxLength) {
            str = str.substring(0, maxLength - 4) + ' ...';
        }

        return str;
    }
});

Pulss.Utilities.Text = { };

if(window.getSelection){
    Object.extend(Pulss.Utilities.Text, { 
        getRange: function(b) {
            b = b || this.getSelection();
            return b.rangeCount > 0 ? b.getRangeAt(0) : null;
        },
        getSelection: function() {
            return window.getSelection();
        },
        getFocusNode: function(b) {
            b = b || this.getRange();
            return b && b.endContainer;
        },
        getFocusValue: function(c, b) {
            c = c || this.getRange();
            b = b || this.getFocusNode(c);
            return b.data;
        },
        getFocusOffset: function(c, b) {
            c = c || this.getRange();
            return c.endOffset || 0;
        },
        setFocus: function(b, c) {
            if(!b) return;
            this.getSelection().collapse(b, c);
        },
        setFocusAfter: function(b) {
            var c = b.parentNode;
            this.setFocus(c, $A(c.childNodes).indexOf(b) + 1);
        },
        focusElement: function(b) {
            b.focus();
            this.setFocus(b, b.childNodes.length);
        },
        insertBreak: function(e) {
            var r = this.getRange(), s = this.getSelection();
            var n = r.createContextualFragment('<br/>');
            r.insertNode(n);
            //this.setFocusAfter(n);
            //this.focusElement(e);
        },
        selectNode: function(b) {
            if(!b) return;
            var d = this.getSelection(), c = this.getRange(d);
            d.collapse(b, 0);
            c.selectNode(b);
            d.addRange(c);
        }
    });
} else if(document.selection) {
    Object.extend(Pulss.Utilities.Text, { 
        getRange: function() {
            return this.getSelection().createRange();
        },
        getSelection: function() {
            return document.selection;
        },
        getFocusNode: function(c, b) {
            if (b) return b;
            c = c || this.getRange();
            return c.parentElement();
        },
        getFocusValue: function(c, b) {
            c = c || this.getRange();
            b = b || this.getFocusNode(c);
            return b.innerText;
        },
        getFocusOffset: function(e, b) {
            e = e || this.getRange();
            b = b || this.getFocusNode(e);
            var d = b, c = 0;
            while (d == b) {
                e.moveStart('character',-1);
                d = e.parentElement();
                c++;
            }
            return e.text.length;
        },
        setFocus: function(f, g) {
            var i = this.getRange(), c = i.parentElement(), e = 0, b = [], h = f.previousSibling;
            while (h) {
                var j = h.previousSibling;
                b.push(c.removeChild(h));
                h = j;
            }
            i.moveToElementText(c);
            i.collapse();
            i.moveEnd('character', (g + e));
            i.collapse(false);
            i.select();
            for (var d = 0; d < b.length; d++) {
                c.insertBefore(b[d], c.firstChild);
            }
        },
        setFocusAfter: function(b) {
            var c = this.getRange();
            c.moveToElementText(b);
            c.moveEnd('character', 1);
            c.collapse(false);
            c.select();
        },
        focusElement: function(b) {
            b.focus();
            this.setFocusAfter(b);
        },
        insertBreak: function() {
            var b = this.getRange();
            b.pasteHTML('<br>');
            b.moveEnd('character',1);
            b.collapse();
            b.select();
        },
        selectNode: function(b) {
            var c = this.getRange();
            c.moveToElementText(b);
            c.moveStart('character',-1);
            c.moveEnd('character',1);
            c.select();
        }
    });
}

Pulss.UI = { };

Pulss.UI.Controller = { elements: { } };

Object.extend(Pulss.UI.Controller, { 
    focus: function(elementId) {
        if (this.elements[elementId] == undefined) {
            this.init(elementId);
        }
        this.elements[elementId].onfocus();
    },  
    init: function(elementId, options) {
        var element = Pulss.UI.Composer.Element(elementId, options);
        this.elements[elementId] = element;
        return this.elements[elementId];
    },
    getElement: function(elementId) {
        return this.elements[elementId];
    },  
    unsetElement: function(elementId) {
        this.elements[elementId] = undefined;
    },  
    cleanupDefaultValue: function(elementId, defaultValue, className) {
        if ($(elementId) && $F(elementId) == defaultValue) {
            $(elementId).value = '';
            $(elementId).removeClassName(className);
        }
    },    
    resetDefaultValue: function(elementId, defaultValue, className) {
        if($(elementId) && $F(elementId).blank()){
            $(elementId).addClassName(className);
            $(elementId).value = defaultValue;      
        }
    },
    busy: function(elementId) {
        if ($(elementId)) {
            $(elementId).addClassName('UI_Busy');
        }
    },  
    unbusy: function(elementId) {
        if ($(elementId)) {
            $(elementId).removeClassName('UI_Busy');
        }
    },
    getDocHeight: function() {
        var D = document;
        return Math.max(
                Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
                Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
                Math.max(D.body.clientHeight, D.documentElement.clientHeight)
        );
    }
});

Pulss.UI.Composer = { };

Object.extend(Pulss.UI.Composer, {
    Element: function(elementId, options) {
        try{
            if ($(elementId)) {
                if ($(elementId).type) {
                    // Element
                    switch ($(elementId).type) {
                        case Pulss.UI.Composer.Element.BUTTON:
                            return new Pulss.UI.Element.Button(elementId, options);
                        case Pulss.UI.Composer.Element.TEXTAREA:
                            return new Pulss.UI.Element.Textarea(elementId, options);
                        case Pulss.UI.Composer.Element.TEXT:
                            if ($(elementId).hasClassName('UI_Tags')) {
                                return new Pulss.UI.Element.Tags(elementId, options);
                            } else if ($(elementId).hasClassName('UI_Recipients')) {
                                return new Pulss.UI.Element.Recipients(elementId, options);
                            } else {
                                return new Pulss.UI.Element.Text(elementId, options);
                            }
                    } 
                } else {
                    // Module
                    if ($(elementId).hasClassName('UI_Message')) {
                        return new Pulss.UI.Module.Message(elementId, options);
                    }
                }
                   
            }
        } catch(err) { Pulss.Logger.error(err); }
    }
});

Object.extend(Pulss.UI.Composer.Element, {
    BUTTON:     'button',
    TEXTAREA:   'textarea',
    TEXT:       'text'
});

(function(UI) {
    UI.Module = Class.create({
        initialize: function(elementId, options) {
            this.id = elementId;
            this.element = $(this.id) || null;
            this.options = { };
            Object.extend(this.options, options || { });
        }
    }); 
})(Pulss.UI);

(function(UI) {
    UI.Module.Message = Class.create(UI.Module, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
        
            this.intellisenseHooks = { };
        
            var element = new Element('div', { 'id': 'UI_Element_' + this.id, 'class': 'UI_Message_Container' });
            element.hide();
            
            Object.extend(this.element, {
                onclick: function(event) {
                    event = event || window.event;
                    this.placeholder.hide();
                    this.element.show();
                    if (this.subject) {
                        this.subject.onfocus();
                    } else {
                        this.message.onfocus();
                    }
                }.bind(this)
            });
        
            this.placeholder = Object.extend(this.element, { });
    
            this.element = element;
            
            this.placeholder.insert( { after: this.element } );      
            
            if (this.placeholder.hasClassName('UI_Addon_Subject'))
                this.initializeSubject();
            
            
            this.messageContainer = new Element('div', { 'class': 'UI_Textarea_Container clearfix' });
            this.message = new Element('textarea', { 'class': 'UI_Textarea', 'id': this.element.id + '_textarea' }).update(this.options.defaultValues.message); 
            this.element.insert( { bottom: this.messageContainer.update(this.message) } );
            this.message = Pulss.UI.Controller.init(this.message.identify(), { defaultValue: this.options.defaultValues.message });
            
            if (this.placeholder.hasClassName('UI_Addon_Tags'))
                this.initializTags();
            
            if (this.placeholder.hasClassName('UI_Addon_Attachments'))
                this.initializeAttachments();
            
            if (this.placeholder.hasClassName('UI_Addon_Recipients'))
                this.initializeRecipients();
            
            this.button = new Element('button').update(this.options.buttonTitle);
            
            this.element.insert( { bottom: this.button } );
            
            delete this.messageContainer;
        },
        initializeSubject: function() {
            this.subject = new Element('input', { 'class': 'UI_Subject', 'id': this.element.id + '_subject', 'type': 'text', 'value': this.options.defaultValues.subject });
            this.element.insert({ bottom: new Element('div', { 'class': 'UI_Subject_Container' }).update(this.subject) } );
            this.subject = Pulss.UI.Controller.init(this.subject.identify(), { defaultValue: this.options.defaultValues.subject });
        },
        initializTags: function() {
            this.tags = new Element('input', { 'class': 'UI_Tags', 'id': this.element.id + '_tags', 'type': 'text' });
            this.messageContainer.insert( { bottom: new Element('div', { 'class': 'UI_Tags_Container UI_Element_Attachment_Hide clearfix', 'id': this.element.id + '_tag_container' } ).update(this.tags) } );
            this.tags = Pulss.UI.Controller.init(this.tags.identify(), {  
                requestUrl: '/services/ui/search-tags', 
                baseId: this.element.id
            });
        },
        initializeAttachments: function() {
            this.messageContainer.insert( { bottom: new Element('div', { 'class': 'UI_Attachment_Types UI_Element_Attachment_Hide clearfix', 'id': this.element.id + '_attachment_types' } ) } );
            this.element.insert( { bottom: new Element('div', { 'class': 'UI_Attachments', 'id': this.element.id + '_attachments' } ) } );
            this.attachments = new Object.extend(new Pulss.UI.Element.Textarea.Attachments(), { baseId: this.element.id });
            this.attachments.init();
        },
        initializeRecipients: function() {
            this.recipients = new Element('input', { 'class': 'UI_Recipients', 'id': this.element.id + '_recipients', 'type': 'text', 'value': this.options.defaultValues.recipient });
            this.element.insert({ bottom: new Element('div', { 'class': 'UI_Recipient_Container UI_Element_Attachment_Hide' }).update(this.recipients) } );
            this.recipients = Pulss.UI.Controller.init(this.recipients.identify(), { 
                requestUrl: '/services/ui/search-recipients',
                baseId: this.element.id,
                selected: this.recipientSelected.bind(this),
                defaultValue: this.options.defaultValues.recipient,
                groups: [{id: '1', title: Pulss.Locale.Translate._('Everyone_in_this_group')}] //FIXME GroupId
            });
        },
        recipientSelected: function() { },
        setValue: function(value) {
            // TODO
        },
        getValue: function() {
            // TODO
        },
        reset: function() {
            // TODO
        },
        getAttachments: function() {
            if (this.attachments)
                return this.attachments.getAttachments();
        }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element = Class.create({
        initialize: function(elementId, options) {
            this.id = elementId;
            this.element = $(this.id) || null;
            this.options = { };
            Object.extend(this.options, options || { });
            
            Object.extend(this.element, {
                onfocus: function(event) {
                    event = event || window.event;
                    this.onfocus(event);
                }.bind(this),
                onblur: function(event) {
                    event = event || window.event;
                    this.onblur(event);
                }.bind(this)
            });
        },
        setValue: function(value) {
            this.element.value = value;
        },  
        getValue: function() {
            return $F(this.element);
        },
        getElement: function() {
            return this.element;
        },  
        onfocus: function() {
            if (this.getValue() == this.defaultValue) {
                this.setValue('');
                this.element.removeClassName('UI_Inactive');
            }    
            this.element.focus();
        },
        onblur: function() {
            if (this.getValue().blank()) {
                this.reset();
            }    
        },
        reset: function() {
            this.setValue(this.defaultValue);
            this.element.addClassName('UI_Inactive');
        }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Button = Class.create(UI.Element, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
            //TODO
        }
    });
})(Pulss.UI);
   
(function(UI) {
    UI.Element.Datetime = Class.create(UI.Element, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
    
            this.element = new Element('div', {'class': 'UI_Datetime', 'id': 'UI_Element_' + this.id});
    
            this.date = new Element('input');
            this.element.insert( new Element('div', {'class': 'UI_Date'}).update(this.date));
    
            var time = new Element('div', {'class': 'UI_Time'});
            this.hour = new Element('select');
    
            this.hour.insert(new Element('option', {'value': ''}).update('--'));
            for (var h = 0; h <= 23; h++) {
                hValue = (h < 10) ? '0' + h : h;
                this.hour.insert(new Element('option', {'value': hValue}).update(hValue));
            }
    
            time.insert(this.hour);
            time.insert(new Element('span').update(' : '));
    
            this.minute = new Element('select');
    
            this.minute.insert(new Element('option', {'value': ''}).update('--'));
            for (var m = 0; m < 60; m = m + 5) {
                mValue = (m < 10) ? '0' + m : m;
                this.minute.insert(new Element('option', {'value': mValue}).update(mValue));
            }
    
            time.insert(this.minute);
    
            this.element.insert(time);
        }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Autocomplete = Class.create(UI.Element, {
        initialize: function($super, elementId, options) {
            $super(elementId, UI.Element.Autocomplete.DEFAULT_OPTIONS);    
            
            Object.extend(this.options, options || { });
            
            this.defaultValue =  this.options.defaultValue || '';
            
            this.items = $H();
            
            this.menu = new S2.UI.Menu();
            this.menu.options.closeOnOutsideClick = false;
            this.menu.observe('ui:menu:selected', this.selected.bind(this));
            
            this.searchInput = Object.extend(this.element, { });
            if (this.defaultValue != null && $F(this.element) == this.defaultValue) {
                this.searchInput.addClassName('UI_Inactive');
            }
            
            var element = new Element('div', {'class': 'UI_Autocomplete_Box clearfix'});
            this.element.replace(element);
            this.element = element;
            this.element.insert(this.searchInput);
            
            this.searchResults = new Element('div', {'class': 'UI_Autocomplete_Search_Results'}).hide();
            this.searchResults.update(this.menu);
            $(this.element).up().insert(this.searchResults);
            
            this.advice = new Element('div', {'class': 'UI_Autocomplete_Advice'}).hide();
            this.adviceInfo = new Element('span');
            this.adviceInfo.update(Pulss.Locale.Translate._('Search_'));
            this.advice.update(this.adviceInfo);
            $(this.element).up().insert(this.advice);
            
            Object.extend(this.searchInput, {
                onkeyup: function(event){
                    event = event || window.event;
                    this.onSearchKeyup(event);        
                }.bind(this),
                onkeydown: function(event){
                    event = event || window.event;
                    this.onSearchKeydown(event);        
                }.bind(this),
                onfocus: function(event) {
                    event = event || window.event;
                    this.onSearchFocus(event);
                }.bind(this),
                onblur: function(event) {
                    event = event || window.event;
                    this.onSearchBlur(event);
                }.bind(this)
            });
            
            this.observers = {
                selectedKeypress: this.selectedKeypress.bind(this)
            };
        },    
        open: function() {
            this.closeAdvice();
            this.menu.open();
            this.searchResults.show();      
        },    
        close: function() {
            this.menu.close();
            this.searchResults.hide();
        },
        openAdvice: function() {
            this.advice.show();      
        },    
        closeAdvice: function() {
            this.advice.hide();
        },
        getSearchValue: function(){
            return $F(this.searchInput);  
        },      
        onSearchKeyup: function(event) {
            var value = this.getSearchValue();
            
            if (value) {
                if (value.blank() || value.length < this.options.minCharacters || value == this.defaultValue) {
                    // Empty values mean the menu should be hidden and all timers
                    // should be unscheduled.
                    this.close();
                    this.unschedule();
                    this.searchValue = '';
                    return;
                }
            
                if (value !== this.searchValue) {
                    // Value has changed.
                    this.schedule();          
                }
            } else {
                this.close();
                this.unschedule();
            }
          
            this.searchValue = value;
        },      
        onSearchKeydown: function(event) {
            if (S2.UI.modifierUsed(event)) return;
            
            var keyCode = event.keyCode || event.charCode;
            if (this.menu.isOpen()) {
                switch (keyCode) {
                    case Event.KEY_UP:
                        this.menu.moveHighlight(-1);
                        Event.stop(event);
                        break;
                    case Event.KEY_DOWN:
                        this.menu.moveHighlight(1);
                        Event.stop(event);
                        break;
                    case Event.KEY_RETURN:
                        this.menu.selectChoice();
                        this.close();
                        this.unschedule();
                        this.searchValue = '';
                        
                        this.searchInput.setValue('');
                        this.searchInput.focus();
                        Event.stop(event);
                        break;
                    case Event.KEY_ESC:
                        this.onSearchBlur();
                        break;
                }
            } else {
                switch (keyCode) {
                    case Event.KEY_BACKSPACE:
                        if (this.getSearchValue().length == 0) {
                            var itemIds = this.items.keys();
                            if(itemIds[itemIds.length - 1] != this.selectedItemId){
                                Event.stop(event);
                                this.focusItem(itemIds[itemIds.length - 1]);
                            }
                        }
                        break;
                }
            }
        },    
        onSearchFocus: function(event) {
            this.openAdvice();
            
            if (this.selectedItemId) {
                this.blurItem(this.selectedItemId);
            }
            
            if (this.getSearchValue() == this.defaultValue) {
                this.searchInput.setValue('');
                this.searchInput.removeClassName('UI_Inactive');            
            } else if(!this.getSearchValue().blank()) {
                this.searchInput.focus(); 
                this.open();
            }       
        },    
        onSearchBlur: function(event){
            this.close();    
            this.closeAdvice();
            this.unschedule();
          
            if (this.getSearchValue().blank()) {
                this.reset();
            }
        },
        onfocus: function() { },
        onblur: function() { },
        reset: function() {
            this.searchInput.setValue(this.defaultValue);
            this.searchInput.addClassName('UI_Inactive');
        },    
        schedule: function() {
            this.unschedule();
            this.timeout = this.change.bind(this).delay(this.options.frequency);
        },    
        unschedule: function() {
            if (this.timeout) window.clearTimeout(this.timeout);
        },    
        change: function() {
            this.findResults();
        },    
        findResults: function(){
            var params = { q: this.searchValue };
            
            if (typeof(this.options.params) == 'function') {
                Object.extend(params, this.options.params());
            } else if (typeof(this.options.params) == 'object') {
                Object.extend(params, this.options.params);
            }
            
            var responseText = '{"data":{"results":[{"id":"1","title":"Thomas Schedler"},{"id":"2","title":"Thomas Reeja"},{"id":"3","title":"Thomas Manoj"},{"id":"4","title":"Schedler Thomas"}]}}';
            this.setResults(responseText.evalJSON());
            
            /*
            new Ajax.Request(this.options.requestUrl, {
                method: 'get',
                parameters: params,
                onComplete: function(response) {
                    if (response.status == 200) {
                        if (response.responseJSON != undefined) {
                            this.setResults(response.responseJSON);
                        } else if (response.responseText.isJSON()) {
                            this.setResults(response.responseText.evalJSON());
                        } else {
                            this.setResults({ });
                        }
                    }
                }.bind(this)
            });
            */
        },    
        setResults: function(response) {
            if (response.data && response.data.results) {
                this.results = response.data.results;
                this.updateResults(response.data.results);
            }
        },    
        updateResults: function(results) {            
            this.menu.clear();
            
            // Build a case-insensitive regexp for highlighting the substring match.
            var needle = new RegExp(RegExp.escape(this.searchValue), 'i');
            results.each(function(result) {
                if (!this.items.get(this.options.idPrefix + result.id)) {
                    var text = this.options.highlightSubstring ? result.title.replace(needle, '<b>$&</b>') : result.title;
                    
                    var li = new Element('li', { 'class' : 'item' }).update(new Element('div', { 'class' : 'title' }).update('<a href="#" onclick="return false;">' + text + '</a>'));
                    if (typeof(this.options.row) == 'function') {
                        li = this.options.row(result, text);
                    }
                    
                    li.store('ui.search.result', result);
                    this.menu.addChoice(li);
                }
            }.bind(this));
              
            if (results.length === 0) {
                this.close();
            } else {
                this.open();
            }
        },    
        selected: function(event) {
            Event.stop(event);
            
            var memo = event.memo, li = memo.element;
          
            if (li) {
                var data = li.retrieve('ui.search.result');
                
                this.close();
                this.unschedule();
                this.searchValue = '';
            
                this.searchInput.setValue('');
                this.onSearchFocus();

                this.addItem(data);
            
                if(typeof(this.options.selected) == 'function'){
                    this.options.selected(data);
                }
                
                return true;
            } else {
                return false;
            }   
        },
        addItem: function(data) {
            data.elementId = this.options.idPrefix + data.id;
            
            if (!this.items.get(data.elementId, data)) {
                this.items.set(data.elementId, data);                
                var item = new Element('div', { 'class': 'UI_Item clearfix ' + this.options.idPrefix, id: data.elementId }).update(data.title);
                
                var removeIcon = new Element('a', {'href': '#', 'class': 'remove'});
                removeIcon.observe('mousedown', Event.stop);
                removeIcon.observe('click', function(event) {
                  Event.stop(event);
                  this.removeItem(data.elementId);
                }.bind(this));
                item.insert(removeIcon);
                
                item.observe('mousedown', Event.stop);
                item.observe('click', function(event) {
                    Event.stop(event);
                    if (this.selectedItemId == data.elementId) {
                        this.blurItem(data.elementId);
                    } else {
                        this.focusItem(data.elementId);
                    }
                  }.bind(this));
                
                this.searchInput.insert({ before: item });
            }
        },
        removeItem: function(id) {
            if ($(id)) {
                this.blurItem(id);            
                this.items.unset(id);
                $(id).remove();
                
                if (this.selectedItemId == id) {
                    this.selectedItemId = null;
                }
                
                this.searchInput.focus();
            }
        },
        focusItem: function(id){
            if ($(id)) {
                if (this.selectedItemId) {
                    $(this.selectedItemId).removeClassName('UI_Selected');
                }
                
                this.searchInput.blur();
                
                $(id).addClassName('UI_Selected');
                this.selectedItemId = id;
    
                Event.observe(window.document, 'keydown', this.observers.selectedKeypress);
            }
        },
        blurItem: function(id){
            $(id).removeClassName('UI_Selected');
            if (this.selectedItemId == id) {
                this.selectedItemId = null;
            }
            Event.stopObserving(window.document, 'keydown', this.observers.selectedKeypress);
        },    
        selectedKeypress: function(event) {
            var keyCode = event.keyCode || event.charCode;
    
            switch (keyCode) {
                case Event.KEY_BACKSPACE:
                case Event.KEY_DELETE:
                    Event.stop(event);
                    this.removeItem(this.selectedItemId);                
                    break;
                case Event.KEY_ESC:
                    this.blurItem(this.selectedItemId);
                    break;
            }
        }
    });
    
    Object.extend(UI.Element.Autocomplete, {
        DEFAULT_OPTIONS: {
          frequency: 0.25,
          minCharacters: 3,      
          highlightSubstring: true,
          idPrefix: 'item_'
        }
    }); 
})(Pulss.UI);

(function(UI) {
    UI.Element.Tags = Class.create(UI.Element.Autocomplete, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
            this.adviceInfo.update(Pulss.Locale.Translate._('Search_for_tags_or_add_a_new_one_'));
            this.options.idPrefix = 'tag_';
            this.newTagCounter = 0;
            
            this.element.insert({ top: new Element('div', {'class': 'lbl'}).update(Pulss.Locale.Translate._('Tags') + ':') });
        },
        onSearchKeydown: function($super, event) {
            $super(event);
            
            var keyCode = event.keyCode || event.charCode;
            
            switch (keyCode) {
                case Event.KEY_COMMA:
                    Event.stop(event);
                    
                    this.newTagCounter++;
                    var data = { id: 'new_' + this.newTagCounter, title: this.getSearchValue() };
                    
                    this.close();
                    this.unschedule();
                    this.searchValue = '';
                
                    this.searchInput.setValue('');
                    this.onSearchFocus();
    
                    this.addItem(data);
                    break;
            }
        }
    }); 
})(Pulss.UI);

Object.extend(Event, {
    KEY_COMMA: 188
});

(function(UI) {
    UI.Element.Recipients = Class.create(UI.Element.Autocomplete, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
            
            this.options.idPrefix = 'r_m';
            
            this.menu.stopObserving('ui:menu:selected');
            this.menu.observe('ui:menu:selected', this.selectedMember.bind(this));
                    
            this.groups = new S2.UI.Menu();
            this.groups.options.closeOnOutsideClick = false;
            this.groups.observe('ui:menu:selected', this.selectedGroup.bind(this));
            
            this.options.groups.each(function(group) {
                var li = new Element('li', { 'class' : 'item' }).update(new Element('div', { 'class' : 'title' }).update('<a href="#" onclick="return false;">' + group.title + '</a>'));
                li.store('ui.search.result', group);
                this.groups.addChoice(li);
            }.bind(this));
            
            this.advice.insert(this.groups);
            this.groups.selectChoice(0);
            this.onSearchBlur();
        },
        noMoreGroupsToSelect: function() {
            this.groups.close();
            this.adviceInfo.update(Pulss.Locale.Translate._('Search_for_person_'));
            this.groups.moveHighlight(-1);
        },
        resetGroupsToSelect: function() {
            this.groups.open();
            this.adviceInfo.update(Pulss.Locale.Translate._('Search_for_person_or_speak_to_'));
        },
        onSearchKeydown: function($super, event) {
            var keyCode = event.keyCode || event.charCode;
            if (this.groups.isOpen() && !this.menu.isOpen()) {
                switch (keyCode) {
                    case Event.KEY_UP:
                        this.groups.moveHighlight(-1);
                        Event.stop(event);
                        break;
                    case Event.KEY_DOWN:
                        this.groups.moveHighlight(1);
                        Event.stop(event);
                        break;
                    case Event.KEY_RETURN:
                        this.groups.selectChoice();
                        Event.stop(event);
                        break;
                }
            }
            
            $super(event);
        },
        selectedMember: function(event) {
            this.options.idPrefix = 'r_m';
            this.selected(event);
        },
        selectedGroup: function(event) {
            this.options.idPrefix = 'r_g';
            
            if (this.selected(event)) {                
                if (this.groups.choices.length == 1) {
                    this.noMoreGroupsToSelect();
                }
            }
            
            // reset id prefix
            this.options.idPrefix = 'r_m';
        },
        removeItem: function($super, id) {
            $super(id);
            
            if (id.startsWith('r_g')) {
                this.resetGroupsToSelect();                    
            }
        }
    }); 
})(Pulss.UI);

(function(UI) {
    UI.Element.Text = Class.create(UI.Element, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
            
            this.defaultValue =  this.options.defaultValue || null;
            
            if (this.defaultValue != null && $F(this.element) == this.defaultValue) {
                this.element.addClassName('UI_Inactive');
            }
        }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea = Class.create(UI.Element, {
        initialize: function($super, elementId, options) {
            $super(elementId, options);
        
            this.intellisenseHooks = { };
    
            this.defaultValue =  this.options.defaultValue || null;
        
            var cssClasse = 'UI_Textarea ' + this.element.classNames();
            if (this.defaultValue != null && $F(this.element) == this.defaultValue) cssClasse += ' UI_Inactive';
            
            var element = new Element('div', {'class': cssClasse, 'id': 'UI_Element_' + this.id, 'contenteditable': 'true'}).update((!$F(this.element).blank() ? $F(this.element) : '<br/>'));
        
            this.parent = Object.extend(this.element, { });
    
            this.element.replace(element);
            this.element = element;
            
            // FIXME fallback for browsers not supporting contenteditable
        
            Object.extend(this.element, {
                onfocus: function(event) {
                    event = event || window.event;
                    this.onfocus(event);
                }.bind(this),
                onblur: function(event) {
                    event = event || window.event;
                    this.onblur(event);
                }.bind(this)
            });
                
            if (this.element.hasClassName('UI_Addon_Intellisense'))
                this.initializeIntellisense();
        },
        onfocus: function() {
            if (this.getValue() == this.defaultValue) {
                this.setValue('<br/>');
                this.element.removeClassName('UI_Inactive');
            }    
            this.element.focus();
        },
        onblur: function() {
            if (this.getValue().stripScripts().stripTags().blank()) {
                this.setValue(this.defaultValue);
                this.element.addClassName('UI_Inactive');
            }    
        },
        onkeydown: function(event) {
            if (event.keyCode == Event.KEY_RETURN) {
                if (document.selection) {
                    Event.stop(event);
                    Pulss.Utilities.Text.insertBreak(this.element);
                }
            }
        },
        setValue: function(value) {
            this.element.update(value);
        },
        getValue: function() {
            return this.element.innerHTML; //window.getSelection();
        },
        reset: function() {
            this.setValue(this.defaultValue);
            this.element.addClassName('UI_Inactive');
    
            if(this.attachments)
                this.attachments.reset();
        },
        initializeIntellisense: function() {
        
            this.addIntellisenseHook({ name: 'tags', delimiter: '#', key: 51, source: '/intellisense/tags', element: this.element });
            this.addIntellisenseHook({ name: 'members', delimiter: '@', key: 71, source: '/intellisense/members', element: this.element });
        
            Object.extend(this.element, {
                onkeydown: function(event) {
                    event = event || window.event;
                    this.onkeydown(event);
                    this.checkIntellisenseHooks(event);        
                }.bind(this)
            });
        },
        addIntellisenseHook: function(hookProperties) {
            var hook = Object.extend(new Pulss.UI.Element.Textarea.Intellisense.Hook(), hookProperties);
            this.intellisenseHooks[hook.key] = hook; 
        },
        checkIntellisenseHooks: function(event) {
            if (this.intellisenseHooks[event.keyCode]) {
                setTimeout(function() {
                    this.intellisenseHooks[event.keyCode].init();
                }.bind(this), 0);
            }
        }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments = Class.create({
        initialize: function() {
            this.baseId;
            this.attachments = [];
            this.items = [];
        },      
        init: function(){
            if ($(this.baseId + '_attachment_types') && $(this.baseId + '_attachments')) {
                this.attachments.push(new UI.Element.Textarea.Attachments.Attachment.Files(this.baseId, this));
                this.attachments.push(new UI.Element.Textarea.Attachments.Attachment.Link(this.baseId, this));
                this.attachments.push(new UI.Element.Textarea.Attachments.Attachment.Video(this.baseId, this));
                //this.attachments.push(new Pulss.UI.Element.Textarea.Attachments.Attachment.Date(this.baseId, this));
          
                this.actionBox = new Element('div', {'class': 'icons clearfix'});
                this.attachments.each(function(attachment) {
                    this.actionBox.insert(attachment.getActionIcon());
                }.bind(this));
          
                $(this.baseId + '_attachment_types').update(new Element('div', {'class': 'lbl'}).update(Pulss.Locale.Translate._('Attach') + ':'));
                $(this.baseId + '_attachment_types').insert(this.actionBox);      
          
                this.container = $(this.baseId + '_attachments');         
            }  
      },
      reset: function(){
          this.attachments.each(function(attachment) {
              attachment.reset();
          });
          this.items = [];
      },
      getAttachments: function(){
          return this.items.compact();
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments.Attachment = Class.create({
      initialize: function(elementId, type, attachments) {
        this.elementId = elementId;
        this.attachments = attachments;
        this.attachmentId = null;
        this.attachmentIds = {};
        this.type = type;
        this.active = false;
        this.counter = 0;    
      },
      
      init: function(){
        if(this.active == false){         
          $(this.elementId + '_attachments').insert({bottom: this.getAddContainer()});
          $$('div.UI_Element_Attachment_Hide').each(function(el){el.hide();});
          this.active = true;      
        }
      },
      
      getActionIcon: function(icon){ 
        this.actionIcon = new Element('a', {'href': '#', 'class': this.type});
        this.actionIcon.observe('mousedown', Event.stop);
        this.actionIcon.observe('click', function(event) {
          Event.stop(event);
          this.init();
        }.bind(this));
        return this.actionIcon;
      },
    
      close: function(){
        if($(this.attachmentId)){
          $(this.attachmentId).remove();
          $$('div.UI_Element_Attachment_Hide').each(function(el){el.show();});
          this.active = false;
        }      
      },
      
      reset: function(){
        $(this.elementId + '_attachments').update('');
        this.attachmentIds = { };
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments.Attachment.Files = Class.create(UI.Element.Textarea.Attachments.Attachment, {
      initialize: function($super, elementId, attachments) {
        $super(elementId, 'files', attachments);    
      },
      
      upload: function(){
        UI.Controller.busy(this.attachmentContainer);
        
        var name = this.elementId + '_' + this.type + '_attachment_'  + this.counter + '_upload';
        
        if(!$(name)){
          this.iFrame = new Element('iframe', {'src' : 'about:blank', 'class': 'blind', 'name': name, 'id': name});
          this.iFrame.observe('load', function(event) {
            this.uploaded();
          }.bind(this));
          this.box.insert(this.iFrame);
        }
        
        var responseType = new Element('input', {'name': 'response_type', 'type': 'hidden', 'value': 'JSON'});
        this.form.insert(responseType);
        
        this.form.setAttribute('target', name);
        this.form.setAttribute('action', '/services/ui/file-upload-tmp');
        this.form.submit();
      },
      
      uploaded: function(){
        UI.Controller.unbusy(this.attachmentContainer);
        
        if(this.iFrame.contentWindow.document.body && this.iFrame.contentWindow.document.body.innerHTML.isJSON()){
          response = this.iFrame.contentWindow.document.body.innerHTML.evalJSON().response;
          
          if(response.status == 200 && response.data){
            
            var myAttachmentId = this.attachmentId;
            
            this.head.remove();
            
            this.images = new Element('div', {'class': 'images'});
            this.images.insert(new Element('div', {'class': 'head'}).insert(new Element('span', {'class': 'title'}).update('Images')));
            this.docs = new Element('div', {'class': 'docs'});
            this.docs.insert(new Element('div', {'class': 'head'}).insert(new Element('span', {'class': 'title'}).update('Documents')));
            var hasImages = false, hasDocs = false;
            
            if(response.data.files){
              response.data.files.each(function(file){
                file = file.file;
                
                var removeIcon = new Element('a', {'href': '#', 'class': 'remove'});
                removeIcon.observe('mousedown', Event.stop);
                removeIcon.observe('click', function(event) {
                  Event.stop(event);
                  this.remove(myAttachmentId, file, event);
                }.bind(this));
                            
                if(file.isImage == 'true'){
                  var image = new Element('div', {'class': 'img', 'id': 'file_' + file.id});
                  image.insert(new Element('img', {'src': '/clients' + file.path + '100x100/' + file.id + '.' + file.extension}));
                  
                  image.insert(removeIcon);
                  this.images.insert(image);
                  hasImages = true;
                }else{
                  var doc = new Element('div', {'class': 'doc', 'id': 'file_' + file.id});
                  doc.update(new Element('span', {'class': 'icon ' + this.type}));
                  doc.insert(file.name + '.' + file.extension);
                  doc.insert(new Element('span').update(' (' + file.size + ')'));              
                        
                  doc.insert(removeIcon);
                  this.docs.insert(doc);
                  hasDocs = true;
                }            
              }.bind(this));          
            }
            
            this.attachmentContainer.update('');
            if(hasImages) this.attachmentContainer.insert(this.images.insert(new Element('div', {'class': 'clear'})));
            if(hasDocs) this.attachmentContainer.insert(this.docs);
                   
            this.box.addClassName('item');
            this.box.removeClassName('add');
    
            var attachment = { type: this.type, data: response.data.files };
            this.attachments.items.push(attachment);
            this.attachmentIds[myAttachmentId] = this.attachments.items.length - 1; 
            
            $$('div.UI_Element_Attachment_Hide').each(function(el){el.show();});
            this.active = false;
          }else{
            //TODO ERROR
          }
        }else{
          //TODO ERROR
        }
      },
      
      remove: function(attachmentId, file, event){
        this.removeAttachmentId = attachmentId;
        this.removefile = file;    
        var confirm = new UI.Dialog.Confirm({msg: (file.isImage == 'true' ? Pulss.Locale.Translate._('Q_Delete_img') : Pulss.Locale.Translate._('Q_Delete_doc')), onSuccess: this.removeNow.bind(this)});
        var layout = new Element.Layout(event.element());
        confirm.open(layout.get('top'));
      }, 
      
      removeNow: function(){
        if($(this.removeAttachmentId)){
          if($('file_' + this.removefile.id)){
            
            UI.Controller.busy(this.attachmentContainer);
            
            new Ajax.Request('/services/ui/file-delete-tmp', {
              method: 'post',
              parameters: this.removefile,
              onComplete: function(response) {
                UI.Controller.unbusy(this.attachmentContainer);
                if(response.status == 200){            
                  $('file_' + this.removefile.id).remove();
                }          
              }.bind(this)
            });
          }
          
          if(this.attachments.items[this.attachmentIds[this.removeAttachmentId]]){
            files = this.attachments.items[this.attachmentIds[this.removeAttachmentId]].data;
            
            files.each(function(file, index){ 
              file = file.file;
              if(file.id == this.removefile.id){
                this.attachments.items[this.attachmentIds[this.removeAttachmentId]].data.splice(index, 1);
              }
            }.bind(this));
            
            if(this.attachments.items[this.attachmentIds[this.removeAttachmentId]].data.length == 0){
              $(this.removeAttachmentId).remove();
              this.attachments.items[this.attachmentIds[this.removeAttachmentId]] = undefined;
            }
          } 
        }
      },
      
      getAddContainer: function(){
        this.counter++;
        this.attachmentId = this.elementId + '_' + this.type + '_attachment_'  + this.counter;
        this.box = new Element('div', {'id': this.attachmentId, 'class': 'add'});
        
        this.head = new Element('div', {'class': 'head'});
        
        this.closeIcon = new Element('a', {'href': '#', 'class': 'close'});
        this.closeIcon.observe('mousedown', Event.stop);
        this.closeIcon.observe('click', function(event) {
          Event.stop(event);
          this.close();
        }.bind(this));    
        
        this.head.insert(this.closeIcon);
        
        this.headTitle = new Element('span', {'class': 'title'});
        this.headTitle.insert(new Element('span', {'class': 'icon ' + this.type}));
        this.headTitle.insert(Pulss.Locale.Translate._('Files'));
        this.head.insert(this.headTitle);
        
        this.box.insert(this.head);
        
        this.attachmentContainer = new Element('div', {'class': 'attachment clearfix'});
        
        this.fileContainer = new Element('div', {'class': 'entry'});
        this.form = new Element('form', {'method': 'post', 'enctype': 'multipart/form-data'});
        this.form.observe('submit', function(event) {
          Event.stop(event);
        }.bind(this));
        
        this.file = new Element('input', {'type': 'file', 'multiple': 'multiple'});
        this.form.insert(this.file);
        this.fileContainer.insert(this.form);
        
        if(this.file.multiple !== "multiple"){
          this.file.setAttribute('name', 'files[]');
        }else{
          this.file.setAttribute('name', 'file');
        }      
            
        this.actionContainer = new Element('div', {'class': 'action'});
        this.button = new Element('button');
        this.button.update(Pulss.Locale.Translate._('Add'));
        this.button.observe('mousedown', Event.stop);
        this.button.observe('click', function(event) {
          Event.stop(event);
          this.upload();
        }.bind(this));    
        this.actionContainer.insert(this.button);
            
        this.attachmentContainer.insert(this.actionContainer);    
        
        this.attachmentContainer.insert(this.fileContainer);
        
        this.attachmentContainer.insert(new Element('div', {'class': 'clear'}));
        
        this.box.insert(this.attachmentContainer);    
        
        return this.box;    
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments.Attachment.Link = Class.create(UI.Element.Textarea.Attachments.Attachment, {
      initialize: function($super, elementId, attachments) {
        $super(elementId, 'link', attachments);
      },
      
      add: function(){
        if($(this.attachmentId)){
          UI.Controller.busy(this.attachmentContainer);
          
          new Ajax.Request('/services/ui/link-info', {
            method: 'get',
            parameters: {
              link: this.entry.value
            },
            onComplete: function(response) {
              UI.Controller.unbusy(this.attachmentContainer);
              if(response.status == 200){            
                if(response.responseJSON != undefined){
                  this.addLink(response.responseJSON);
                }else if(response.responseText.isJSON()){
                  this.addLink(response.responseText.evalJSON());
                }else{
                  this.addLink({});
                }
              }          
            }.bind(this)
          });
          
        }
      },
      
      addLink: function(info){
        if(info && info.response && info.response.status == 200 && info.response.data){
          this.attachmentContainer.remove();
          
          var myAttachmentId = this.attachmentId;
          
          this.removeIcon = new Element('a', {'href': '#', 'class': 'remove'});
          this.removeIcon.observe('mousedown', Event.stop);
          this.removeIcon.observe('click', function(event) {
            Event.stop(event);
            this.remove(myAttachmentId, event);
          }.bind(this));    
          
          this.head.update(this.removeIcon);
          
          this.link = new Element('a', {'href': info.response.data.infos.url, 'target': '_blank'});
          this.link.insert(info.response.data.infos.title);
          this.headTitle.update(new Element('span', {'class': 'icon ' + this.type}));
          this.headTitle.insert(this.link);
          this.head.insert(this.headTitle);
          
          if(info.response.data.infos.description != ''){
            var description = new Element('div', {'class': 'description'});
            description.update(info.response.data.infos.description);
            this.head.insert(description);
          }
          
          this.box.addClassName('item');
          this.box.removeClassName('add');
    
          var attachment = {type: this.type, data: {url: info.response.data.infos.url, title: info.response.data.infos.title, description: info.response.data.infos.description}};
          this.attachments.items.push(attachment);
          this.attachmentIds[myAttachmentId] = this.attachments.items.length - 1; 
          
          $$('div.UI_Element_Attachment_Hide').each(function(el){el.show();});
          this.active = false;
        }else{
          //TODO ERROR
        }
      },
      
      remove: function(attachmentId, event){
        this.removeAttachmentId = attachmentId;
        var confirm = new UI.Dialog.Confirm({msg: Pulss.Locale.Translate._('Q_Delete_link'), onSuccess: this.removeNow.bind(this)});
        var layout = new Element.Layout(event.element());
        confirm.open(layout.get('top'));
      }, 
      
      removeNow: function(){
        if($(this.removeAttachmentId)){
          $(this.removeAttachmentId).remove();
          if(this.attachments.items[this.attachmentIds[this.removeAttachmentId]])
            this.attachments.items[this.attachmentIds[this.removeAttachmentId]] = undefined;
        }
      },
      
      getAddContainer: function(){
        this.counter++;
        this.attachmentId = this.elementId + '_' + this.type + '_attachment_'  + this.counter;
        this.box = new Element('div', {'id': this.attachmentId, 'class': 'add'});
        
        this.head = new Element('div', {'class': 'head'});
        
        this.closeIcon = new Element('a', {'href': '#', 'class': 'close'});
        this.closeIcon.observe('mousedown', Event.stop);
        this.closeIcon.observe('click', function(event) {
          Event.stop(event);
          this.close();
        }.bind(this));    
        
        this.head.insert(this.closeIcon);
        
        this.headTitle = new Element('span', {'class': 'title'});
        this.headTitle.insert(new Element('span', {'class': 'icon ' + this.type}));
        this.headTitle.insert(Pulss.Locale.Translate._('Link'));
        this.head.insert(this.headTitle);
        
        this.box.insert(this.head);
        
        this.attachmentContainer = new Element('div', {'class': 'attachment clearfix'});
        
        this.entryContainer = new Element('div', {'class': 'entry'});
        this.entry = new Element('input', {'type': 'text', 'value': 'http://'});
        this.entryContainer.insert(this.entry);
            
        this.actionContainer = new Element('div', {'class': 'action'});
        this.button = new Element('button');
        this.button.update(Pulss.Locale.Translate._('Add'));
        this.button.observe('mousedown', Event.stop);
        this.button.observe('click', function(event) {
          Event.stop(event);
          this.add();
        }.bind(this));    
        this.actionContainer.insert(this.button);
            
        this.attachmentContainer.insert(this.actionContainer);   
        
        this.attachmentContainer.insert(this.entryContainer);
        
        this.attachmentContainer.insert(new Element('div', {'class': 'clear'}));
        
        this.box.insert(this.attachmentContainer);    
        
        return this.box;
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments.Attachment.Video = Class.create(UI.Element.Textarea.Attachments.Attachment, {
      initialize: function($super, elementId, attachments) {
        $super(elementId, 'video', attachments);
      },
    
      add: function(){
        if($(this.attachmentId)){
          UI.Controller.busy(this.attachmentContainer);
    
          new Ajax.Request('/services/ui/video-info', {
            method: 'get',
            parameters: {
              url: this.videoUrl.value,
              code: this.entryCode.value
            },
            onComplete: function(response) {
              UI.Controller.unbusy(this.attachmentContainer);
              if(response.status == 200){
                if(response.responseJSON != undefined){
                  this.addVideo(response.responseJSON);
                }else if(response.responseText.isJSON()){
                  this.addVideo(response.responseText.evalJSON());
                }else{
                  this.addVideo({});
                }
              }
            }.bind(this)
          });
    
        }
      },
    
      addVideo: function(info){
        if(info && info.response && info.response.status == 200 && info.response.data){
          this.attachmentContainer.remove();
    
          var myAttachmentId = this.attachmentId;
    
          this.removeIcon = new Element('a', {'href': '#', 'class': 'remove'});
          this.removeIcon.observe('mousedown', Event.stop);
          this.removeIcon.observe('click', function(event) {
            Event.stop(event);
            this.remove(myAttachmentId, event);
          }.bind(this));
    
          this.head.update(this.removeIcon);
    
          if(info.response.data.infos.thumbnail != ''){
            var thumbnail = new Element('div', {'class': 'thumbnail'});
            thumbnail.update(new Element('img', {'src': info.response.data.infos.thumbnail}));
            this.head.insert(thumbnail);
          }
    
          this.link = new Element('a', {'href': info.response.data.infos.url, 'target': '_blank'});
          this.link.insert(info.response.data.infos.title);
          this.headTitle.update(new Element('span', {'class': 'icon ' + this.type}));
          this.headTitle.insert(this.link);
          this.head.insert(this.headTitle);
                
          if(info.response.data.infos.description != ''){
            var description = new Element('div', {'class': 'description video'});
            description.update(info.response.data.infos.description);
            this.head.insert(description);
          }
    
          this.head.insert(new Element('div', {'class': 'clear'}));
    
          this.box.addClassName('item');
          this.box.removeClassName('add');
    
          var attachment = {type: this.type, data: info.response.data.infos};
          this.attachments.items.push(attachment);
          this.attachmentIds[myAttachmentId] = this.attachments.items.length - 1;
    
          $$('div.UI_Element_Attachment_Hide').each(function(el){el.show();});
          this.active = false;
        }else{
          //TODO ERROR
        }
      },
    
      remove: function(attachmentId, event){
        this.removeAttachmentId = attachmentId;
        var confirm = new UI.Dialog.Confirm({msg: Pulss.Locale.Translate._('Q_Delete_video'), onSuccess: this.removeNow.bind(this)});
        var layout = new Element.Layout(event.element());
        confirm.open(layout.get('top'));
      },
    
      removeNow: function(){
        if($(this.removeAttachmentId)){
          $(this.removeAttachmentId).remove();
          if(this.attachments.items[this.attachmentIds[this.removeAttachmentId]])
            this.attachments.items[this.attachmentIds[this.removeAttachmentId]] = undefined;
        }
      },
    
      getAddContainer: function(){
        this.counter++;
        this.attachmentId = this.elementId + '_' + this.type + '_attachment_'  + this.counter;
        this.box = new Element('div', {'id': this.attachmentId, 'class': 'add'});
    
        this.head = new Element('div', {'class': 'head'});
    
        this.closeIcon = new Element('a', {'href': '#', 'class': 'close'});
        this.closeIcon.observe('mousedown', Event.stop);
        this.closeIcon.observe('click', function(event) {
          Event.stop(event);
          this.close();
        }.bind(this));
    
        this.head.insert(this.closeIcon);
    
        this.headTitle = new Element('span', {'class': 'title'});
        this.headTitle.insert(new Element('span', {'class': 'icon ' + this.type}));
        this.headTitle.insert(Pulss.Locale.Translate._('Video'));
        this.head.insert(this.headTitle);
    
        this.box.insert(this.head);
    
        this.attachmentContainer = new Element('div', {'class': 'attachment clearfix'});
    
        this.entryUrlContainer = new Element('div', {'class': 'entry'});
        //this.entryUrlContainer.insert(new Element('div', {'class': 'info'}).update(Pulss.Locale.Translate._('Video_url')));
        this.videoUrl = new Element('input', {'type': 'text', 'value': 'http://'});
        this.entryUrlContainer.insert(this.videoUrl);
        //this.entryUrlContainer.insert(new Element('div', {'class': 'info'}).update(Pulss.Locale.Translate._('or_embed_Code')));
        this.entryCodeContainer = new Element('div', {'class': 'entry code'});
        this.entryCode = new Element('textarea');
        this.entryCodeContainer.insert(this.entryCode);
    
        this.actionContainer = new Element('div', {'class': 'action'});
        this.button = new Element('button');
        this.button.update(Pulss.Locale.Translate._('Add'));
        this.button.observe('mousedown', Event.stop);
        this.button.observe('click', function(event) {
          Event.stop(event);
          this.add();
        }.bind(this));
        this.actionContainer.insert(this.button);
    
        //this.attachmentContainer.insert(this.entryCodeContainer);
    
        this.attachmentContainer.insert(this.actionContainer);
    
        this.attachmentContainer.insert(this.entryUrlContainer);
    
        this.attachmentContainer.insert(new Element('div', {'class': 'clear'}));
    
        this.box.insert(this.attachmentContainer);
    
        return this.box;
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Element.Textarea.Attachments.Attachment.Date = Class.create(UI.Element.Textarea.Attachments.Attachment, {
      initialize: function($super, elementId, attachments) {
        $super(elementId, 'date', attachments);
      },
    
      getAddContainer: function(){
        this.counter++;
        this.attachmentId = this.elementId + '_' + this.type + '_attachment_'  + this.counter;
        this.box = new Element('div', {'id': this.attachmentId, 'class': 'add'});
    
        this.head = new Element('div', {'class': 'head'});
    
        this.closeIcon = new Element('a', {'href': '#', 'class': 'close'});
        this.closeIcon.observe('mousedown', Event.stop);
        this.closeIcon.observe('click', function(event) {
          Event.stop(event);
          this.close();
        }.bind(this));
    
        this.head.insert(this.closeIcon);
    
        this.headTitle = new Element('span', {'class': 'title'});
        this.headTitle.insert(new Element('span', {'class': 'icon ' + this.type}));
        this.headTitle.insert(Pulss.Locale.Translate._('Date'));
        this.head.insert(this.headTitle);
    
        this.box.insert(this.head);
    
        this.attachmentContainer = new Element('div', {'class': 'attachment clearfix'});
    
        this.entryContainer = new Element('div', {'class': 'entry'});
        this.startDate = new UI.Element.Datetime('attachment_date_start', {});
        this.endDate = new UI.Element.Datetime('attachment_date_end', {});
        this.entryContainer.insert(this.startDate.getElement());
        this.entryContainer.insert(this.endDate.getElement());
        
        this.actionContainer = new Element('div', {'class': 'action'});
        this.button = new Element('button');
        this.button.update(Pulss.Locale.Translate._('Add'));
        this.button.observe('mousedown', Event.stop);
        this.button.observe('click', function(event) {
          Event.stop(event);
          this.add();
        }.bind(this));
        this.actionContainer.insert(this.button);
    
        this.attachmentContainer.insert(this.actionContainer);
    
        this.attachmentContainer.insert(this.entryContainer);
    
        this.attachmentContainer.insert(new Element('div', {'class': 'clear'}));
    
        this.box.insert(this.attachmentContainer);
    
        return this.box;
      }
    });
})(Pulss.UI);


Pulss.UI.Element.Textarea.Intellisense = {};

(function(UI) {
    UI.Element.Textarea.Intellisense.Hook = Class.create({
      initialize: function() {
        this.name = '';
        this.delimiter = '';
        this.key = 0;
        this.source = '';
        this.element = {};
        
        this.active = false;
      },
      
      init: function(){
        if(this.active == false){
          this.start();
        }
      },
      
      start: function(){
        this.active = true;
        this.element.observe('keydown', function(){
          setTimeout(function(){
            // Pulss.Logger.debug(this.getValue());
          }.bind(this), 0);
        }.bind(this));
      },
      
      getValue: function(){
        var d = Pulss.Utilities.Text.getRange(), b = Pulss.Utilities.Text.getFocusNode(d,this.element), e = Pulss.Utilities.Text.getFocusValue(d,b), c = Pulss.Utilities.Text.getFocusOffset(d,b);
        // Pulss.Logger.debug('d:');
        // Pulss.Logger.debug(d);
        // Pulss.Logger.debug('b:');
        // Pulss.Logger.debug(b);
        // Pulss.Logger.debug('e:');
        // Pulss.Logger.debug(e);
        // Pulss.Logger.debug('c:');
        // Pulss.Logger.debug(c);
        
        if(!d||!e||d.collapsed===false)return '';
        var a=e.lastIndexOf(this.delimiter,c);
        if(a<0 || (a>0 && (/\\w/).test(e.charAt(a-1)))) return '';
        return e.slice(a,c).strip();
      }
    });
})(Pulss.UI);

Pulss.UI.Video = {};

Object.extend(Pulss.UI.Video, {
  play: function(id, type) {
    try{
      if($('video_unit_' + id)){
        Pulss.UI.Controller.busy('video_unit_' + id);
        var flashvars, params, attributes;
        switch (type) {
          case 'Youtube':
            flashvars = { };
            params = {wmode: 'transparent', allowFullScreen : 'true' , allowscriptaccess : 'always'};
            attributes = { };

            swfobject.embedSWF('http://www.youtube.com/v/' + id + '?fs=1', 'video_unit_' + id, '487', '299', '8.0.0','/swfobject/expressInstall.swf', flashvars, params, attributes);
            break;
          case 'Vimeo':
            flashvars = { };
            params = {wmode: 'transparent', allowFullScreen : 'true' , allowscriptaccess : 'always'};
            attributes = { };

            swfobject.embedSWF('http://vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=00ADEF&amp;fullscreen=1&amp;autoplay=0&amp;loop=0', 'video_unit_' + id, '487', '275', '8.0.0','/swfobject/expressInstall.swf', flashvars, params, attributes);
            break;
        }
      }
    } catch(err) {Pulss.Logger.error(err);}
  }
});

(function(UI) {
    UI.Dialog = Class.create({
      initialize: function(options) {
    
        Object.extend(this.options, options || { });
        this.isOpen = false;
    
        this.element = new Element('div');
    
        this.observers = {
          keypress: this.keypress.bind(this)
        };
      },
    
      position: function() {
        // Find the middle of the viewport.
        var vSize = document.viewport.getDimensions();
        var dialog = this.element;
        var dimensions = {
          width: parseInt(dialog.getStyle('width'), 10),
          height: parseInt(dialog.getStyle('height'), 10)
        };
    
        var position = {
          left: ((vSize.width / 2) - (dimensions.width / 2)).round(),
          top: ((vSize.height / 2) - (dimensions.height / 2)).round()
        };
    
        var offsets = document.viewport.getScrollOffsets();
    
        position.left += offsets.left;
        position.top += offsets.top;
    
        this.element.setStyle({
          //left: '26.154em',
          top: position.top  + 'px'
        });
      },
    
      open: function(top) {
        if (this.isOpen) return;
    
        $(document.body).insert(this.element);
    
        this.element.show();
        this.position();
    
        if(typeof(top) != 'undefined'){
          this.element.setStyle({top: top  + 'px'});
        }
    
        Event.observe(window.document, 'keydown', this.observers.keypress);
        this.isOpen = true;
      },
    
      close: function(success) {
    
        if(success == true && typeof(this.options.onSuccess) == 'function'){
          this.options.onSuccess();
        }
    
        this.element.hide();
    
        this.isOpen = false;
        Event.stopObserving(window.document, 'keydown', this.observers.keypress);
      },
    
      keypress: function(event) {
        if(event.keyCode === Event.KEY_ESC){
          this.close(false);
          return;
        }
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Dialog.Confirm = Class.create(UI.Dialog, {
      initialize: function($super, options) {
        this.options = {msg: Pulss.Locale.Translate._('Q_Delete_item')};
    
        $super(options);
    
        var msg = new Element('div', {'class': 'ui-dialog-msg'});
        msg.update(this.options.msg);
        this.element.insert(msg);
    
        var actions = new Element('div', {'class': 'ui-dialog-actions'});
    
        var button =  new Element('button');
        button.update(Pulss.Locale.Translate._('Yes'));
        button.observe('mousedown', Event.stop);
        button.observe('click', function(event) {
          Event.stop(event);
          this.close(true);
        }.bind(this));
        actions.insert(new Element('div', {'class': 'ui-dialog-action'}).update(button));
    
        var cancel =  new Element('a', {'href': '#', 'class': 'cancle'});
        cancel.update(Pulss.Locale.Translate._('Cancel'));
        cancel.observe('mousedown', Event.stop);
        cancel.observe('click', function(event) {
          Event.stop(event);
          this.close(false);
        }.bind(this));
        actions.insert(new Element('div', {'class': 'ui-dialog-action'}).update(cancel));
    
        this.element.insert(actions);
    
        this.element.setStyle({
          position: 'absolute',
          left: '26.154em',
          overflow: 'hidden',
          zIndex: 300,
          outline: '0'
        });
    
        S2.UI.addClassNames(this.element, 'ui-dialog-confirm');
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Dialog.Advice = Class.create(UI.Dialog, {
      initialize: function($super, options) {
        this.options = {msg: ''};
    
        $super(options);
            
        Object.extend(this.options, options || { });
        this.isOpen = false;
    
        this.element = new Element('div');
    
        var msg = new Element('div', {'class': 'ui-dialog-msg advice'});
        msg.update(this.options.msg);
        this.element.insert(msg);
    
        var actions = new Element('div', {'class': 'ui-dialog-actions'});
    
    
        var accept =  new Element('a', {'href': '#', 'class': 'cancle'});
        accept.update(Pulss.Locale.Translate._('Ok'));
        accept.observe('mousedown', Event.stop);
        accept.observe('click', function(event) {
          Event.stop(event);
          this.close();
        }.bind(this));
        actions.insert(new Element('div', {'class': 'ui-dialog-action'}).update(accept));
    
        this.element.insert(actions);
    
        this.element.setStyle({
          position: 'absolute',
          left: '26.154em',
          overflow: 'hidden',
          zIndex: 300,
          outline: '0'
        });
    
        S2.UI.addClassNames(this.element, 'ui-dialog-confirm');
    
        this.observers = {
          keypress: this.keypress.bind(this)
        };
      },  
    
      close: function() {
    
        this.element.hide();
    
        this.isOpen = false;
        Event.stopObserving(window.document, 'keydown', this.observers.keypress);
    
        if(typeof(this.options.onAccept) == 'function'){
          this.options.onAccept();
        }
      }
    });
})(Pulss.UI);

(function(UI) {
    UI.Handle = Class.create({
      initialize: function(options) {
        this.options = {id: null, actions: [], options: []};
        Object.extend(this.options, options || { });
        this.isOpen = false;
        this.clickAllowed = false;
    
        this.element = new Element('div', {'class': 'handle', 'style': 'display:none;'});
    
        if(this.options.actions.length > 0){
          var hActions = new Element('div');
          this.options.actions.each(function(action){
            var anchor =  new Element('a', {'href': '#'});
            anchor.update(action.title);
            anchor.observe('mousedown', Event.stop);
            anchor.observe('click', function(event) {
              Event.stop(event);
              if(typeof(action.onClick) == 'function'){
                action.onClick();
              }
              this.close();
            }.bind(this));
            hActions.insert(new Element('div').update(anchor));
          }.bind(this));
        
          this.element.update(hActions);
        }
    
        if(this.options.options.length > 0){
          var hOptions = new Element('div');
          this.options.options.each(function(option){
            hOptions.insert(new Element('div').update(option.element));
          }.bind(this));
    
          hOptions.observe('click', function(event) {
            this.clickAllowed = true;
          }.bind(this));
          this.element.update(hOptions);
        }
    
        $(document.body).insert(this.element);
    
        this.observers = {
          keypress: this.keypress.bind(this),
          click: this.click.bind(this)
        };
      },
    
      show: function(pos) {    
        this.element.setStyle({top:(pos.top - this.element.getHeight() + 19) + 'px', left: (pos.left - this.element.getWidth()) + 'px', display: 'block'});
        this.element.show();
    
        if(this.options.id && $(this.options.id + '_handle')) $(this.options.id + '_handle').setStyle({visibility : 'visible'});
    
        if(this.isOpen) return;
        
        Event.observe(window.document, 'keydown', this.observers.keypress);
        Event.observe(window, 'click', this.observers.click);
        this.isOpen = true;
      },
    
      close: function() {
        this.element.hide();
    
        this.isOpen = false;
    
        if(this.options.id && $(this.options.id + '_handle')) $(this.options.id + '_handle').writeAttribute({style : ''});
    
        Event.stopObserving(window.document, 'keydown', this.observers.keypress);
        Event.stopObserving(window, 'click', this.observers.click);
      },
    
      keypress: function(event) {
        if(event.keyCode === Event.KEY_ESC){
          this.close();
          return;
        }
      },
    
      click: function(event) {
        if(this.clickAllowed == false){
          this.close();
        }else{
          this.clickAllowed = false;
        }
        return;
      }
    });
})(Pulss.UI);

Pulss.Locale = {};

Pulss.Locale.Translate = {translate: (typeof(Translate) != 'undefined') ? Translate : {}};

Object.extend(Pulss.Locale.Translate, { 
  _: function(key){
    return (this.translate[key]) ? this.translate[key] : key;
  }
});

Pulss.Locale.Format = {location: 'de_AT'};

Object.extend(Pulss.Locale.Format, { 
  getDate: function(date){
    d = (Number(date.getDate()) > 9) ? String(date.getDate()) : '0' + String(date.getDate());
    m = ((Number(date.getMonth()) + 1) > 9) ? String(Number(date.getMonth()) + 1) : '0' + String(Number(date.getMonth()) + 1);
    Y = String(date.getFullYear());
    return d + '.' + m + '.' + Y;
  },

  getTime: function(date){
    H = (Number(date.getHours()) > 9) ? String(date.getHours()) : '0' + String(date.getHours());
    i = (Number(date.getMinutes()) > 9) ? String(date.getMinutes()) : '0' + String(date.getMinutes());    
    return H + ':' + i;
  }
});

Pulss.Xmpp = {__connection__: null};

Object.extend(Pulss.Xmpp, {
  getConnection: function(options){
    if(Pulss.Xmpp.__connection__ == null) {
      Pulss.Xmpp.__connection__ = new Pulss.Xmpp.Connection(options);
    }
    return Pulss.Xmpp.__connection__.instance;
  },

  disconnect: function(){
    if(Pulss.Xmpp.__connection__ != null) {
      Pulss.Xmpp.__connection__.instance.disconnect();
    }
  }
});

Pulss.Xmpp.Contact = Class.create({
  initialize: function() {
    this.id = '';
    this.name = '';
    this.subscription = 'none';
    this.groups = [];
    this.status = Pulss.Xmpp.Contact.Status.Unavailable;
  },

  updateStatus: function(status){
    if(status == Pulss.Xmpp.Contact.Status.Available){
      this.status = Pulss.Xmpp.Contact.Status.Available;
    }else{
      this.status = Pulss.Xmpp.Contact.Status.Unavailable;
    }
    Model.getInstance().setContextualData('contact_status', this);
  }
});

Pulss.Xmpp.Contact.Status = {Available: 'available', Unavailable: 'unavailable'};

Pulss.Xmpp.Contacts = {};

Pulss.Xmpp.Connection = Class.create({
  initialize: function(options) {
    this.options = {bosh_service: '/xmpp-httpbind'};
    Object.extend(this.options, options || { });

    this.instance = new Strophe.Connection(this.options.bosh_service);
    this.instance.rawInput = this.rawInput.bind(this);
    this.instance.rawOutput = this.rawOutput.bind(this);
  },

  rawInput: function(data){
    //Pulss.Logger.debug('RECV: ' + data);
  },

  rawOutput: function(data){
    //Pulss.Logger.debug('SENT: ' + data);
  }
});

Pulss.Xmpp.Connection.Stream = { };

Object.extend(Pulss.Xmpp.Connection.Stream, {
  onConnect: function(status){
    if (status == Strophe.Status.CONNECTING) {
      //Pulss.Logger.debug('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
      //Pulss.Logger.debug('Strophe failed to connect.');
    } else if (status == Strophe.Status.DISCONNECTING) {
      //Pulss.Logger.debug('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
      //Pulss.Logger.debug('Strophe is disconnected.');
    } else if (status == Strophe.Status.CONNECTED) {
      //Pulss.Logger.debug('Strophe is connected.');
      Pulss.Xmpp.getConnection().addHandler(Pulss.Xmpp.Connection.Stream.updateStream, null, 'message', 'stream:update', null, null);
      Pulss.Xmpp.getConnection().addHandler(Pulss.Xmpp.Connection.Stream.presenceHandler, null, 'presence', null, null, null);

      // build and send initial roster query
      var roster_iq = $iq({type: 'get'}).c('query', {xmlns: Strophe.NS.ROSTER});
      
      Pulss.Xmpp.getConnection().sendIQ(roster_iq, function (iq) {
        var items = Selector.findChildElements(iq, ['item']);

        items.each(function(item) {
          // build a new contact and add it to the roster
          var contact = new Pulss.Xmpp.Contact();
          contact.id = item.getAttribute('jid').substr(0, item.getAttribute('jid').indexOf('@'));
          contact.name = item.getAttribute('name') || '';
          contact.subscription = item.getAttribute('subscription') || 'none';
          Selector.findChildElements(item, ['group']).each(function(group){
            contact.groups.push(Strophe.getText(group));
          });
          Pulss.Xmpp.Contacts[contact.id] = contact;
          //Pulss.Logger.debug(contact);
        }.bind(this));
      }.bind(this));
      
      Pulss.Xmpp.getConnection().send($pres().tree());
    }
  },

  updateStream: function(msg){
    //Pulss.Logger.debug(msg);
    //Pulss.Logger.debug(msg.getAttribute('from'));
    
    var elems = msg.getElementsByTagName('body');
    var body = elems[0];
    // Pulss.Logger.debug(Strophe.getText(body));
        
    // we must return true to keep the handler alive.
    // returning false would remove it afPulss.Xmpp.Contactster it finishes.
    return true;
  },

  presenceHandler: function(msg){
    contactId = msg.getAttribute('from').substr(0, msg.getAttribute('from').indexOf('@'));
    if(Pulss.Xmpp.Contacts[contactId]){
      Pulss.Xmpp.Contacts[contactId].updateStatus(msg.getAttribute('type') || Pulss.Xmpp.Contact.Status.Available);
    }

    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
    return true;
  }
});

Pulss.Loader = {};

Pulss.Loader.Scroll = Class.create({
  initialize: function(options) {
    this.options = {onBottom: null, onTop: null};
    Object.extend(this.options, options || { });

    this.observers = {
      scroll: this.scroll.bind(this)
    };

    Event.observe(window, 'scroll', this.observers.scroll);
  },

  scroll: function(){
    var docScrollOffset = document.viewport.getScrollOffsets();
    if(docScrollOffset.top == 0 && typeof(this.options.onTop) == 'function'){
      this.options.onTop();
    }else if((docScrollOffset.top + document.viewport.getHeight() + 1) >= Pulss.UI.Controller.getDocHeight() && typeof(this.options.onBottom) == 'function'){
      this.options.onBottom();
    }
  }
});