from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter

class FlowSearch(BrowserView):

    def __call__(self):
        navigation_root = self.navigation_root

        if 'SearchableText' in self.request.form and 'path' not in self.request.form:
#            self.request.RESPONSE.redirect(navigation_root.absolute_url() + '/@@flowsearch?' + self.request['QUERY_STRING'] + '&' + "%2F".join(navigation_root.getPhysicalPath()) ) # query...
            self.request.RESPONSE.redirect('%s/@@flowsearch?%s&path=%s' % (navigation_root.absolute_url(),
                                                                      self.request['QUERY_STRING'],
                                                                      "%2F".join(navigation_root.getPhysicalPath())
                                                                     ))
        return super(FlowSearch, self).__call__()


    @property
    def navigation_root_url(self):
        return self.navigation_root.absolute_url()

    @property
    def navigation_root(self):
        return self.portal_state.navigation_root()

    @property
    def portal_state(self):
        return getMultiAdapter((self.context, self.request),
                                        name=u'plone_portal_state')

    @property
    def is_rtl(self):
        return self.portal_state.is_rtl()

    @property
    def breadcrumbs(self):
        breadcrumbs_view = getMultiAdapter((self.context, self.request),
                                           name='breadcrumbs_view')
        return breadcrumbs_view.breadcrumbs()
