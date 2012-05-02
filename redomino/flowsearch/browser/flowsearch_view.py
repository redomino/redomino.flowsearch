from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter

class FlowSearch(BrowserView):

    def __call__(self):
        portal_state = getMultiAdapter((self.context, self.request),
                                        name=u'plone_portal_state')
        navigation_root = portal_state.navigation_root()

        if 'path' not in self.request.form:
            self.request.RESPONSE.redirect(navigation_root.absolute_url() + '/@@flowsearch?' + self.request['QUERY_STRING'] + '&' + "%2F".join(navigation_root.getPhysicalPath()) ) # query...
            self.request.RESPONSE.redirect('%s/@@flowsearch?%s&path=%s' % (navigation_root.absolute_url(),
                                                                      self.request['QUERY_STRING'],
                                                                      "%2F".join(navigation_root.getPhysicalPath())
                                                                     ))
        return super(FlowSearch, self).__call__()


