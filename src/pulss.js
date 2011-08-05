var Pulss = { version: '0.0.1' };

Pulss.Logger = { hasConsole: (typeof(console) != 'undefined') };

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
    init: function(elementId) {
        var element = Pulss.UI.Composer.Element(elementId);
        this.elements[elementId] = element;
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
    Element: function(elementId) {
        try{
            if ($(elementId)) {
                switch ($(elementId).type) {
                    case Pulss.UI.Composer.Element.BUTTON:
                        return new Pulss.UI.Element.Button(elementId, {});
                    case Pulss.UI.Composer.Element.TEXTAREA:
                        return new Pulss.UI.Element.Textarea(elementId, {});
                }
            }
        } catch(err) { Pulss.Logger.error(err); }
    }
});

Object.extend(Pulss.UI.Composer.Element, {
    BUTTON:     'button',
    TEXTAREA:   'textarea'
});

Pulss.UI.Element = Class.create({
    initialize: function(elementId, options) {
        this.id = elementId;
        this.element = $(this.id) || null;
        this.options = { };
        Object.extend(this.options, options || { });
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

Pulss.UI.Element.Button = Class.create(Pulss.UI.Element, {
    initialize: function($super, elementId, options) {
        $super(elementId, options);
        //TODO
    }
});

Pulss.UI.Element.Datetime = Class.create(Pulss.UI.Element, {
    initialize: function($super, elementId, options) {
        $super(elementId, options);

        this.element = new Element('div', {'class': 'UI_Datetime', 'id': 'UI_Element_' + this.id});

        this.date = new Element('input');
        this.element.insert( new Element('div', {'class': 'UI_Date'}).update(this.date));

        var time = new Element('div', {'class': 'UI_Time'});
        this.hour = new Element('select');

        this.hour.insert(new Element('option', {'value': ''}).update('--'));
        for (h = 0; h <= 23; h++) {
            hValue = (h < 10) ? '0' + h : h;
            this.hour.insert(new Element('option', {'value': hValue}).update(hValue));
        }

        time.insert(this.hour);
        time.insert(new Element('span').update(' : '));

        this.minute = new Element('select');

        this.minute.insert(new Element('option', {'value': ''}).update('--'));
        for (m = 0; m < 60; m = m + 5) {
            mValue = (m < 10) ? '0' + m : m;
            this.minute.insert(new Element('option', {'value': mValue}).update(mValue));
        }

        time.insert(this.minute);

        this.element.insert(time);
    }
});

Pulss.UI.Element.Textarea = Class.create(Pulss.UI.Element, {
    initialize: function($super, elementId, options) {
        $super(elementId, options);
    
        this.intellisenseHooks = { };

        this.defaultValue = this.element.readAttribute('default');
    
        var cssClasse = 'UI_Textarea ' + this.element.classNames();
        if (this.defaultValue != null && $F(this.element) == this.defaultValue) cssClasse += ' UI_Inactive';

        var element = new Element('div', {'class': cssClasse, 'id': 'UI_Element_' + this.id, 'contentEditable': 'true'}).update((!$F(this.element).blank() ? $F(this.element) : '<br/>'));
    
        this.parent = Object.extend(this.element, { });

        this.element.replace(element);
        this.element = element;
    
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
    
        if (this.element.hasClassName('UI_Addon_Attachments'))
            this.initializeAttachments();
    
        if (this.element.hasClassName('UI_Addon_Recipients'))
            this.initializeRecipients();
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
    getAttachments: function() {
        if (this.attachments)
            return this.attachments.getAttachments();
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
    },
    initializeAttachments: function() {
        this.attachments = new Object.extend(new Pulss.UI.Element.Textarea.Attachments(), { textarea: this });
        this.attachments.init();
    },
    initializeRecipients: function() {
      // TODO
    }
});

Pulss.UI.Element.Textarea.Attachments = Class.create({
  initialize: function() {
    this.textarea;
    this.attachments = [];
    this.items = [];
  },
  
  init: function(){
    if($(this.textarea.id + '_attachments') && $(this.textarea.id + '_attachment_types')){
      this.attachments.push(new Pulss.UI.Element.Textarea.Attachments.Attachment.Files(this.textarea.id, this));
      this.attachments.push(new Pulss.UI.Element.Textarea.Attachments.Attachment.Link(this.textarea.id, this));
      this.attachments.push(new Pulss.UI.Element.Textarea.Attachments.Attachment.Video(this.textarea.id, this));
      //this.attachments.push(new Pulss.UI.Element.Textarea.Attachments.Attachment.Date(this.textarea.id, this));
      
      this.actionBox = new Element('div', {'class': 'icons'});
      this.attachments.each(function(attachment){
        this.actionBox.insert(attachment.getActionIcon());
      }.bind(this));
      
      $(this.textarea.id + '_attachment_types').update(this.actionBox);   
      
      this.container = new Element('div', {'id': this.textarea.id + '_attachments', 'class': 'attachments'}); 
      $(this.textarea.id + '_attachments').insert({before: this.container});         
    }  
  },

  reset: function(){
    this.attachments.each(function(attachment){
      attachment.reset();
    });
    this.items = [];
  },
  
  getAttachments: function(){
    return this.items.compact();
  }
});

Pulss.UI.Element.Textarea.Attachments.Attachment = Class.create({
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
    this.attachmentIds = {};
  }
});

Pulss.UI.Element.Textarea.Attachments.Attachment.Files = Class.create(Pulss.UI.Element.Textarea.Attachments.Attachment, {
  initialize: function($super, elementId, attachments) {
    $super(elementId, 'files', attachments);    
  },
  
  upload: function(){
    Pulss.UI.Controller.busy(this.attachmentContainer);
    
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
    Pulss.UI.Controller.unbusy(this.attachmentContainer);
    
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
    var confirm = new Pulss.UI.Dialog.Confirm({msg: (file.isImage == 'true' ? Pulss.Locale.Translate._('Q_Delete_img') : Pulss.Locale.Translate._('Q_Delete_doc')), onSuccess: this.removeNow.bind(this)});
    var layout = new Element.Layout(event.element());
    confirm.open(layout.get('top'));
  }, 
  
  removeNow: function(){
    if($(this.removeAttachmentId)){
      if($('file_' + this.removefile.id)){
        
        Pulss.UI.Controller.busy(this.attachmentContainer);
        
        new Ajax.Request('/services/ui/file-delete-tmp', {
          method: 'post',
          parameters: this.removefile,
          onComplete: function(response) {
            Pulss.UI.Controller.unbusy(this.attachmentContainer);
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
    
    this.attachmentContainer = new Element('div', {'class': 'attachment'});
    
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

Pulss.UI.Element.Textarea.Attachments.Attachment.Link = Class.create(Pulss.UI.Element.Textarea.Attachments.Attachment, {
  initialize: function($super, elementId, attachments) {
    $super(elementId, 'link', attachments);
  },
  
  add: function(){
    if($(this.attachmentId)){
      Pulss.UI.Controller.busy(this.attachmentContainer);
      
      new Ajax.Request('/services/ui/link-info', {
        method: 'get',
        parameters: {
          link: this.entry.value
        },
        onComplete: function(response) {
          Pulss.UI.Controller.unbusy(this.attachmentContainer);
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
    var confirm = new Pulss.UI.Dialog.Confirm({msg: Pulss.Locale.Translate._('Q_Delete_link'), onSuccess: this.removeNow.bind(this)});
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
    
    this.attachmentContainer = new Element('div', {'class': 'attachment'});
    
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

Pulss.UI.Element.Textarea.Attachments.Attachment.Video = Class.create(Pulss.UI.Element.Textarea.Attachments.Attachment, {
  initialize: function($super, elementId, attachments) {
    $super(elementId, 'video', attachments);
  },

  add: function(){
    if($(this.attachmentId)){
      Pulss.UI.Controller.busy(this.attachmentContainer);

      new Ajax.Request('/services/ui/video-info', {
        method: 'get',
        parameters: {
          url: this.videoUrl.value,
          code: this.entryCode.value
        },
        onComplete: function(response) {
          Pulss.UI.Controller.unbusy(this.attachmentContainer);
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
    var confirm = new Pulss.UI.Dialog.Confirm({msg: Pulss.Locale.Translate._('Q_Delete_video'), onSuccess: this.removeNow.bind(this)});
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

    this.attachmentContainer = new Element('div', {'class': 'attachment'});

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

Pulss.UI.Element.Textarea.Attachments.Attachment.Date = Class.create(Pulss.UI.Element.Textarea.Attachments.Attachment, {
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

    this.attachmentContainer = new Element('div', {'class': 'attachment'});

    this.entryContainer = new Element('div', {'class': 'entry'});
    this.startDate = new Pulss.UI.Element.Datetime('attachment_date_start', {});
    this.endDate = new Pulss.UI.Element.Datetime('attachment_date_end', {});
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


Pulss.UI.Element.Textarea.Intellisense = {};

Pulss.UI.Element.Textarea.Intellisense.Hook = Class.create({
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

Pulss.UI.Dialog = Class.create({
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

    Event.observe(window, 'keydown', this.observers.keypress);
    this.isOpen = true;
  },

  close: function(success) {

    if(success == true && typeof(this.options.onSuccess) == 'function'){
      this.options.onSuccess();
    }

    this.element.hide();

    this.isOpen = false;
    Event.stopObserving(window, 'keydown', this.observers.keypress);
  },

  keypress: function(event) {
    if(event.keyCode === Event.KEY_ESC){
      this.close(false);
      return;
    }
  }
});

Pulss.UI.Dialog.Confirm = Class.create(Pulss.UI.Dialog, {
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

Pulss.UI.Dialog.Advice = Class.create(Pulss.UI.Dialog, {
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
    Event.stopObserving(window, 'keydown', this.observers.keypress);

    if(typeof(this.options.onAccept) == 'function'){
      this.options.onAccept();
    }
  }
});

Pulss.UI.Handle = Class.create({
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
    
    Event.observe(window, 'keydown', this.observers.keypress);
    Event.observe(window, 'click', this.observers.click);
    this.isOpen = true;
  },

  close: function() {
    this.element.hide();

    this.isOpen = false;

    if(this.options.id && $(this.options.id + '_handle')) $(this.options.id + '_handle').writeAttribute({style : ''});

    Event.stopObserving(window, 'keydown', this.observers.keypress);
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